#!/usr/bin/env python3
"""
convert_punctuation.py
将 docs/Rust/*.md 文件中中文语境里的英文逗号 , 和句号 . 替换为中文标点 ，和 。

规则：
  - ,  → ，  （所有非保护文本区域）
  - .  → 。  （行尾，或后面紧跟中文字符时）
  - 不改变：冒号 :、括号 ()、省略号 ...
  - 保护区域：多行代码块（```...```）、内联代码（`...`）、Markdown 链接 URL（](...)）

用法：
  python convert_punctuation.py --dry-run   # 仅预览，不写入文件
  python convert_punctuation.py             # 执行并写入文件
"""

import re
import sys
from pathlib import Path

# ── 常量 ───────────────────────────────────────────────────────────────────────

# 匹配中文字符（基本汉字 + 扩展A区）
CHINESE_CHAR = r"[\u4e00-\u9fff\u3400-\u4dbf]"
CHINESE_RE = re.compile(CHINESE_CHAR)

# 保护区域：内联代码 `...` 或 Markdown 链接 URL 部分 ](...)
PROTECTED_RE = re.compile(r"`[^`]*`|\]\([^)]*\)")

# 中间句号模式：单个 . 后紧跟中文字符
# 负向后瞻：不是 ... 省略号的一部分，也不是数字后的序号点（如 1.整型）
MID_PERIOD_RE = re.compile(r"(?<![\d\.])\." + "(?=" + CHINESE_CHAR + ")")


# ── 辅助函数 ───────────────────────────────────────────────────────────────────


def has_chinese(text: str) -> bool:
    """检查文本中是否含有中文字符"""
    return bool(CHINESE_RE.search(text))


def process_segment(text: str) -> str:
    """对非保护文本段执行标点替换"""
    # 1. 英文逗号 → 中文逗号
    text = text.replace(",", "，")
    # 2. 中间句号：. 后紧跟中文字符 → 。（避免误改 ... 省略号）
    text = MID_PERIOD_RE.sub("。", text)
    return text


def process_line_content(line: str) -> str:
    """
    处理一行内容（不含行尾换行符）：
      1. 将行切分为保护段和可修改段
      2. 对可修改段执行 process_segment()
      3. 如行含中文且以单个英文句号结尾，替换为 。
    """
    # 切分保护段 / 可修改段
    parts = []
    pos = 0
    for m in PROTECTED_RE.finditer(line):
        if m.start() > pos:
            parts.append((line[pos : m.start()], False))
        parts.append((m.group(), True))
        pos = m.end()
    if pos < len(line):
        parts.append((line[pos:], False))

    # 替换逗号和中间句号
    result = "".join(process_segment(t) if not p else t for t, p in parts)

    # 替换行尾单个英文句号（含中文时才替换，且不是 .. 或 ... 的一部分）
    if has_chinese(result):
        stripped = result.rstrip()
        trailing = result[len(stripped) :]
        if stripped.endswith(".") and not stripped.endswith(".."):
            result = stripped[:-1] + "。" + trailing

    return result


# ── 文件处理 ───────────────────────────────────────────────────────────────────


def process_file(filepath: Path, dry_run: bool = False) -> int:
    """
    处理单个文件，返回修改行数。
    dry_run=True 时仅统计不写入。
    """
    with open(filepath, "r", encoding="utf-8", newline="") as f:
        content = f.read()

    lines = content.splitlines(keepends=True)
    result: list[str] = []
    in_code_block = False
    in_frontmatter = False
    changes = 0

    for i, line in enumerate(lines):
        # 分离内容和行尾换行符
        rstripped = line.rstrip("\r\n")
        line_ending = line[len(rstripped) :]

        # ── frontmatter ──────────────────────────────────────────────────────
        if i == 0 and rstripped.strip() == "---":
            in_frontmatter = True
            result.append(line)
            continue

        if in_frontmatter:
            if rstripped.strip() == "---":
                in_frontmatter = False
                result.append(line)
                continue
            # 处理 frontmatter 值字段（格式：key: value）
            sep = rstripped.find(": ")
            if sep != -1:
                key_part = rstripped[: sep + 2]  # "key: "
                value_part = rstripped[sep + 2 :]
                new_value = process_line_content(value_part)
                new_rstripped = key_part + new_value
            else:
                new_rstripped = rstripped
            new_line = new_rstripped + line_ending
            if new_line != line:
                changes += 1
            result.append(new_line)
            continue

        # ── 代码块开关 ────────────────────────────────────────────────────────
        if rstripped.strip().startswith("```"):
            in_code_block = not in_code_block
            result.append(line)
            continue

        if in_code_block:
            result.append(line)
            continue

        # ── 普通行 ────────────────────────────────────────────────────────────
        new_rstripped = process_line_content(rstripped)
        new_line = new_rstripped + line_ending
        if new_line != line:
            changes += 1
        result.append(new_line)

    # 写回文件
    if not dry_run and changes > 0:
        with open(filepath, "w", encoding="utf-8", newline="") as f:
            f.write("".join(result))

    return changes


# ── 主程序 ─────────────────────────────────────────────────────────────────────


def main():
    dry_run = "--dry-run" in sys.argv or "-n" in sys.argv

    script_dir = Path(__file__).parent
    docs_path = script_dir / "docs" / "Rust"

    if not docs_path.exists():
        print(f"错误：目录不存在：{docs_path}")
        sys.exit(1)

    md_files = sorted(docs_path.glob("*.md"))
    if not md_files:
        print(f"未找到 .md 文件：{docs_path}")
        sys.exit(1)

    mode = "[DRY RUN] " if dry_run else ""
    print(f"{mode}扫描 {len(md_files)} 个 .md 文件...\n")

    total_changes = 0
    modified_files = 0

    for filepath in md_files:
        n = process_file(filepath, dry_run=dry_run)
        if n > 0:
            modified_files += 1
            total_changes += n
            tag = "(预览)" if dry_run else "已修改"
            print(f"  {tag}  {n:3d} 处  ←  {filepath.name}")

    print(
        f"\n{mode}完成：{modified_files}/{len(md_files)} 个文件，共 {total_changes} 处替换"
    )
    if dry_run:
        print("  → 去掉 --dry-run 参数重新运行以实际写入文件")


if __name__ == "__main__":
    main()
