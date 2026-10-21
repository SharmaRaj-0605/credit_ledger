# Credit Risk Assessment Using SHAP

## Overview

This project uses machine learning to classify loan applications using the `loan_status` column in `credit_risk_dataset.csv`. The notebook explores the dataset, prepares the data, trains and evaluates Logistic Regression and XGBoost models, examines probability calibration, and uses SHAP to explain an XGBoost model's predictions.

## Dataset

The notebook reads the dataset using:

```python
pd.read_csv('credit_risk_dataset.csv')
```

Keep `credit_risk_dataset.csv` in the notebook's working directory, or update the path in the notebook.

The target column is `loan_status`.

The notebook uses these numerical features:

- `person_age`
- `person_income`
- `person_emp_length`
- `loan_amnt`
- `loan_int_rate`
- `loan_percent_income`
- `cb_person_cred_hist_length`

The notebook uses these categorical features:

- `person_home_ownership`
- `loan_intent`
- `loan_grade`
- `cb_person_default_on_file`

## Notebook Workflow

1. **Explore the data:** Display dataset information, shape, missing-value counts, target counts, descriptive statistics, numerical boxplots, and a correlation heatmap.
2. **Clean the data:** Remove duplicate rows; keep ages from 18 to 100; remove rows where employment length exceeds age or 60 years; and keep rows with a positive loan amount.
3. **Split the data:** Create training and test sets using an 80/20 split and stratification by `loan_status`, with `random_state=42`.
4. **Prepare features:** Impute missing numerical values with the median. Impute missing categorical values with `Missing` and apply one-hot encoding. The Logistic Regression pipeline also scales numerical features.
5. **Handle class imbalance:** Calculate a negative-to-positive class ratio from the training target and use it as `scale_pos_weight` for XGBoost. Logistic Regression uses `class_weight="balanced"` in the model pipelines shown in the notebook.
6. **Cross-validate models:** Use 5-fold `StratifiedKFold` cross-validation and report ROC-AUC, accuracy, precision, recall, and F1.
7. **Train and evaluate models:** Train a baseline Logistic Regression pipeline and an XGBoost pipeline. The evaluation function prints classification metrics and a classification report, and plots a confusion matrix and a precision-recall curve.
8. **Tune XGBoost:** Use `RandomizedSearchCV` with 150 parameter samples, 5-fold cross-validation, and `average_precision` scoring.
9. **Examine a decision threshold:** Calculate probabilities for the positive class and derive a threshold from the precision-recall curve, then evaluate XGBoost using that threshold.
10. **Examine calibration:** Apply sigmoid calibration to the best estimator from the randomized search and plot calibration curves for calibrated and uncalibrated probabilities.
11. **Explain predictions with SHAP:** Create a `shap.TreeExplainer`, plot a SHAP summary plot, and create a waterfall plot for one test-set row.
12. **Inspect prediction errors:** Compare actual and predicted labels and count false positives and false negatives.
13. **Save artifacts:** Save the calibrated model and the selected threshold to pickle files.

## Libraries Used

The notebook imports or uses:

- NumPy
- Pandas
- Matplotlib
- Seaborn
- scikit-learn
- XGBoost
- SciPy
- SHAP
- Joblib

Install the dependencies using the project's `requirements.txt`, if present:

```bash
python -m pip install -r requirements.txt
```

## How to Run

1. Open the notebook (`.ipynb`) in Jupyter Notebook, JupyterLab, or VS Code with notebook support.
2. Make sure the required Python libraries are installed.
3. Make sure `credit_risk_dataset.csv` is available at the path used by the notebook.
4. Run the notebook cells in order, from data loading through model training, evaluation, SHAP analysis, and artifact saving.

## Saved Model Files

At the end of the notebook, the following files are written to the current working directory:

- `credit_risk_model.pkl` — the fitted calibrated model (`calibrated_model`).
- `best_threshold.pkl` — the selected decision threshold (`best_threshold`).

These files are saved using Joblib. The notebook's code does not define a FastAPI endpoint or a separate web frontend.
