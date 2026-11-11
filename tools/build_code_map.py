"""Build a read-only, static source index. Python standard library only."""
from pathlib import Path
import argparse
import collections
import datetime
import json
import re
from urllib.parse import quote

BASE = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', type=Path, default=Path(r'D:\Project\PhuongThao\FastBusinessOnline'))
args = parser.parse_args()
root = args.source.resolve()
if not root.is_dir():
    parser.error(f'Source directory does not exist: {root}')
out = BASE / 'docs' / 'code-map'
out.mkdir(parents=True, exist_ok=True)
files = sorted((p for p in root.rglob('*') if p.is_file()), key=lambda p: str(p).lower())
attrs = re.compile(r'\b(controller|table|baseTable|Inherits|Class)\s*=\s*["\']([^"\']+)["\']', re.I)
includes = re.compile(r'\bSYSTEM\s+["\']([^"\']+)["\']', re.I)
execs = re.compile(r'\bexec(?:ute)?\s+(?:@\w+\s*=\s*)?((?:\[?\w+\]?\.)*\[?[A-Za-z_]\w*\]?)', re.I)
title = re.compile(r'<title\b[^>]*\bv\s*=\s*"([^"]*)"', re.I)
page_title = re.compile(r'<%@\s*Page\b[^>]*\bv\s*=\s*"([^"]*)"', re.I)
records = []
for p in files:
    rel = p.relative_to(root).as_posix()
    if not (rel.startswith(('Main/', 'App_Data/Controllers/', 'AppHandler/', 'AppService/')) or rel in ('Default.aspx', 'Global.asax', 'FastBusiness.DataService.asmx')):
        continue
    if p.suffix.lower() not in {'.aspx', '.ascx', '.master', '.f', '.xml', '.ent', '.txt', '.js', '.ashx', '.asmx', '.asax', '.sql'}:
        continue
    data = p.read_bytes()
    encoding = 'utf-8-sig'
    try:
        text = data.decode(encoding)
    except UnicodeDecodeError:
        encoding = 'cp1258'
        text = data.decode(encoding, errors='replace')
    found = title.search(text) or page_title.search(text)
    refs = []
    for kind, regex in [('attribute', attrs), ('include', includes), ('sql_exec', execs)]:
        for m in regex.finditer(text):
            value = m.group(2) if kind == 'attribute' else m.group(1)
            refs.append({'kind': m.group(1).lower() if kind == 'attribute' else kind,
                         'value': value, 'line': text.count('\n', 0, m.start()) + 1})
    records.append({'path': rel, 'title': found.group(1) if found else '', 'encoding': encoding,
                    'encrypted': '<Encrypted>' in text, 'refs': refs})

def cell(s):
    return str(s).replace('|', '\\|').replace('\n', ' ').replace('\r', '')

def link(rel, line=None):
    return f'[{cell(rel)}](' + quote(f'{root.as_posix()}/{rel}', safe='/:') + (f':{line}' if line else '') + ')'

def values(rec, kind):
    return sorted({r['value'] for r in rec['refs'] if r['kind'] == kind}, key=str.lower)

def write(name, text):
    (out / name).write_text(text.rstrip() + '\n', encoding='utf-8')

stats = collections.Counter(p.suffix.lower() or '(none)' for p in files)
payload = {'source': str(root), 'generated_at': datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).isoformat(),
           'method': 'Static regular-expression extraction; declarations and candidate SQL calls, not runtime dependencies.',
           'total_files': len(files), 'extensions': dict(stats.most_common()), 'records': records}
write('index.json', json.dumps(payload, ensure_ascii=False, indent=2))
screens = ['# Chỉ mục màn hình', '', 'Tìm tên tiếng Việt, mã màn hình hoặc Controller bằng Ctrl+F. Controller được trích từ thuộc tính, chưa chứng minh tuyến xử lý runtime.', '', '| Màn hình | Tên hiển thị | Controller | Lớp kế thừa |', '|---|---|---|---|']
for r in records:
    if r['path'].startswith('Main/') and r['path'].endswith('.aspx'):
        screens.append('| ' + ' | '.join([link(r['path']), cell(r['title']), cell(', '.join(values(r, 'controller'))), cell(', '.join(values(r, 'inherits')))]) + ' |')
write('screens.md', '\n'.join(screens))
groups = collections.defaultdict(list)
reverse = collections.defaultdict(list)
for r in records:
    if r['path'].startswith('App_Data/Controllers/'):
        parts = r['path'].split('/')
        groups[parts[2] if len(parts) > 3 else 'Root'].append(r)
    for ref in r['refs']:
        if ref['kind'] in {'table', 'basetable', 'sql_exec'}:
            reverse[(ref['kind'], ref['value'])].append((r['path'], ref['line']))
catalog = ['# Chỉ mục controller', '', 'Các tệp cùng tên ở Dir, Filter, Grid, Report có vai trò khác nhau; tra toàn bộ trước khi sửa. Liên kết dẫn tới source, không sao chép nội dung nghiệp vụ.', '', '| Nhóm | Số tệp văn bản |', '|---|---:|']
for group, items in sorted(groups.items()):
    name = f'controllers-{group.lower()}.md'
    catalog.append(f'| [{group}]({name}) | {len(items)} |')
    lines = [f'# Controllers / {group}', '', '| Tệp | Tiêu đề | table / baseTable | Controller tham chiếu | Mã hóa |', '|---|---|---|---|---|']
    for r in items:
        lines.append('| ' + ' | '.join([link(r['path']), cell(r['title']), cell(', '.join(values(r, 'table') + values(r, 'basetable'))), cell(', '.join(values(r, 'controller'))), 'Có' if r['encrypted'] else '']) + ' |')
    write(name, '\n'.join(lines))
write('controllers.md', '\n'.join(catalog))
lines = ['# Bảng khai báo và lời gọi SQL', '', 'Chỉ gồm thuộc tính table/baseTable và tên sau EXEC/EXECUTE đọc được bằng regex. Không phải ERD; có thể chứa tên biến, comment, bảng tạm hoặc placeholder. Không suy ra định nghĩa stored procedure từ lời gọi.', '']
for (kind, value), hits in sorted(reverse.items(), key=lambda kv: (kv[0][0], kv[0][1].lower())):
    lines.extend([f'## {cell(kind)}: {cell(value)}', ''])
    lines.extend(f'- {link(path, line)}' for path, line in sorted(set(hits)))
    lines.append('')
write('data-references.md', '\n'.join(lines))
lines = ['# Endpoint và lớp xử lý', '', '| Endpoint | Class / Inherits |', '|---|---|']
for r in records:
    if r['path'].endswith(('.ashx', '.asmx', '.asax')):
        lines.append(f"| {link(r['path'])} | {cell(', '.join(values(r, 'class') + values(r, 'inherits')))} |")
write('endpoints.md', '\n'.join(lines))
write('inventory.md', '# Thống kê source\n\n' + f'Tổng số tệp: **{len(files)}**. Tệp văn bản đã lập chỉ mục: **{len(records)}**.\n\n| Đuôi tệp | Số lượng |\n|---|---:|\n' + '\n'.join(f'| `{ext}` | {n} |' for ext, n in stats.most_common()))
print(json.dumps({'source': str(root), 'output': str(out), 'files': len(files), 'indexed': len(records), 'screens': len(screens)-6, 'controller_groups': len(groups), 'data_reference_keys': len(reverse)}, ensure_ascii=False))
