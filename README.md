# STH Month Dashboard

Статическое веб-приложение для просмотра месячной отчетности по проектам, дивизионам, реализации, подбору и маркетингу.

## Публикация на GitHub Pages

1. Откройте настройки репозитория `Settings -> Pages`.
2. В `Build and deployment` выберите `Deploy from a branch`.
3. Branch: `main`, folder: `/root`.
4. Сохраните настройки.

После публикации приложение будет доступно по адресу:

`https://max511028-bit.github.io/month/`

## Данные

- `data/monthly-reports.json` — факты по месяцам и проектам.
- `data/norms.json` — изменяемые нормативы.
- `data/actions.json` — блокеры, драйверы и договоренности как управленческие действия.

Обновить данные из Excel:

```powershell
python scripts/convert_excel.py path\to\source.xlsx data
```
