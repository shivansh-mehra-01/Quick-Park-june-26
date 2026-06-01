@echo off
REM ================================================================
REM  LPR Industry Training Pipeline - One Click Runner
REM  Smart Parking System - ML Model Training
REM ================================================================
title LPR Training Pipeline

echo.
echo  ===================================================
echo   LPR INDUSTRY TRAINING PIPELINE
echo   Smart Parking System - ML Model Training
echo  ===================================================
echo.

REM Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python nahi mila! Pehle Python install karo.
    pause
    exit /b 1
)

echo  [1/4] Eval CSV Generate kar rahe hain...
echo        (XML annotations + Labels CSV se)
echo.
python tools\generate_eval_csv.py --root . --output datasets\eval_ready.csv
if errorlevel 1 (
    echo [WARN] CSV generation mein kuch errors aaye, continue kar rahe hain...
)

echo.
echo  [2/4] OCR Corrector Model Train kar rahe hain...
echo        (Dataset se patterns seekh rahe hain)
echo.
if exist datasets\eval_ready.csv (
    python tools\train_ocr_corrector.py --root . --csv datasets\eval_ready.csv
) else (
    python tools\train_ocr_corrector.py --root . --csv datasets\number_plate_labels.csv
)
if errorlevel 1 (
    echo [WARN] Training mein kuch errors aaye...
)

echo.
echo  [3/4] Model files check kar rahe hain...
if exist models\ocr_corrections.json (
    echo  [OK] ocr_corrections.json - Found!
) else (
    echo  [MISSING] ocr_corrections.json - Not found
)
if exist models\plate_patterns.json (
    echo  [OK] plate_patterns.json - Found!
) else (
    echo  [MISSING] plate_patterns.json - Not found
)
if exist models\training_report.json (
    echo  [OK] training_report.json - Found!
)

echo.
echo  [4/4] Training complete!
echo.
echo  ===================================================
echo   NEXT STEPS:
echo.
echo   Accuracy evaluate karne ke liye:
echo   python tools\evaluate_ocr.py ^
echo     --csv datasets\eval_ready.csv ^
echo     --root . ^
echo     --limit 50 ^
echo     --save-json models\eval_report.json
echo.
echo   Live camera test karne ke liye:
echo   python lpr_sequential.py
echo  ===================================================
echo.
pause
