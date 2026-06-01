@echo off
REM ================================================================
REM  LPR Evaluation Pipeline v2
REM  - Fixed metrics (near-match, wrong OCR rate, etc.)
REM  - Garbage label filtering
REM  - Deduplication
REM ================================================================
title LPR Evaluation v2

echo.
echo  ===================================================
echo   LPR EVALUATION PIPELINE v2
echo  ===================================================
echo.

echo  [1/3] Eval CSV regenerate kar rahe hain (fixed)...
python tools\generate_eval_csv.py --root . --output datasets\eval_ready.csv
if errorlevel 1 (
    echo [WARN] Kuch warnings, continue kar rahe hain...
)

echo.
echo  [2/3] Model train kar rahe hain...
python tools\train_ocr_corrector.py --root . --csv datasets\eval_ready.csv
if errorlevel 1 echo [WARN] Training warnings, continue...

echo.
echo  [3/3] Accuracy evaluate kar rahe hain (100 images, improved metrics)...
echo        (Kuch minutes lagenge...)
python tools\evaluate_ocr.py ^
    --csv datasets\eval_ready.csv ^
    --root . ^
    --limit 100 ^
    --save-json models\eval_report.json

echo.
echo  ===================================================
echo   Full report: models\eval_report.json
echo  ===================================================
pause
