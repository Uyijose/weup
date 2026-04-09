import os
import shutil
from pathlib import Path

# ===== CONFIG =====
ROOT_DIR = Path(".")
OUTPUT_FILE = "PROJECT_STRUCTURE.md"
DELETE_MODE = False

IGNORE_DIRS = {
    "node_modules",
    ".next",
    "dist",
    "build",
    "assets",
    "coverage",
    ".git",
    ".vscode",
    ".idea",
}

IGNORE_PATHS = {
    Path("frontend/test_run").resolve(),
}

IGNORE_FILES = {
    ".DS_Store",
    ".env",
    ".env.local",
    ".env.production",
}

IGNORE_EXTENSIONS = {
    ".log",
}
# ==================


def should_ignore(path: Path):
    try:
        resolved = path.resolve()
    except Exception:
        return True

    for ignored_path in IGNORE_PATHS:
        if resolved == ignored_path or ignored_path in resolved.parents:
            return True

    if path.is_dir() and path.name in IGNORE_DIRS:
        return True

    if path.is_file():
        if path.name in IGNORE_FILES:
            return True
        if path.suffix in IGNORE_EXTENSIONS:
            return True

    return False


def build_tree(base: Path, prefix=""):
    lines = []
    items = sorted(base.iterdir(), key=lambda x: (x.is_file(), x.name.lower()))

    visible_items = [item for item in items if not should_ignore(item)]

    for index, item in enumerate(visible_items):
        connector = "└── " if index == len(visible_items) - 1 else "├── "
        lines.append(prefix + connector + item.name)

        if item.is_dir():
            extension = "    " if index == len(visible_items) - 1 else "│   "
            lines.extend(build_tree(item, prefix + extension))

    return lines


def clean_unnecessary(base: Path):
    for item in base.iterdir():
        if should_ignore(item):
            print(f"[REMOVE] {item}")
            if DELETE_MODE:
                if item.is_dir():
                    shutil.rmtree(item)
                else:
                    item.unlink()
        elif item.is_dir():
            clean_unnecessary(item)


if __name__ == "__main__":
    tree_lines = build_tree(ROOT_DIR)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("# 📁 Project Structure\n\n")
        f.write(
            "This file is auto-generated. "
            "Unnecessary folders (node_modules, build, test_run, etc.) are excluded.\n\n"
        )
        f.write("```\n")
        f.write("\n".join(tree_lines))
        f.write("\n```\n")

    print(f"✅ Project structure saved to {OUTPUT_FILE}")

    print("\n🧹 CLEANING UNUSED FILES/FOLDERS\n")
    if DELETE_MODE:
        print("⚠️ DELETE MODE ENABLED\n")
    else:
        print("ℹ️ DRY RUN (Nothing will be deleted)\n")

    clean_unnecessary(ROOT_DIR)

    print("\n✅ Done")
