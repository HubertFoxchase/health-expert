'''
Created on 4 Mar 2015

@author: Michael Lisovski
'''

def predict_stroke(gender=None,
                   age=None,
                   diabetes=None,
                   hypertension=None,
                   heart_disease=None,
                   smoking_history=None,
                   bmi=None):
    """ Predictor for stroke from model/537a0067d994976c05000a05

        Stroke prediction based on a random sample of the approximately 6 million patient records from GE Medical Quality Improvement Consortium (MQIC) database. 
        Source:
        - http://www.visualizing.org/datasets/mqic-patient-data-100k-sample[*]
        [*]http://www.visualizing.org/datasets/mqic-patient-data-100k-sample: http://www.visualizing.org/datasets/mqic-patient-data-100k-sample
    """
    if (age is None):
        return u'0'
    if (age <= 54.5):
        if (age <= 32.5):
            if (bmi is None):
                return u'0'
            if (bmi <= 24.15612):
                return u'0'
            if (bmi > 24.15612):
                if (heart_disease is None):
                    return u'0'
                if (heart_disease == '1'):
                    if (bmi <= 25.675):
                        return u'1'
                    if (bmi > 25.675):
                        return u'0'
                if (heart_disease == '0'):
                    if (hypertension is None):
                        return u'0'
                    if (hypertension == '1'):
                        return u'0'
                    if (hypertension == '0'):
                        if (gender is None):
                            return u'0'
                        if (gender == 'Female'):
                            if (smoking_history is None):
                                return u'0'
                            if (smoking_history == 'never'):
                                if (age <= 20.5):
                                    return u'0'
                                if (age > 20.5):
                                    if (bmi <= 35.17214):
                                        if (bmi <= 34.22256):
                                            return u'0'
                                        if (bmi > 34.22256):
                                            return u'0'
                                    if (bmi > 35.17214):
                                        return u'0'
                            if (smoking_history == 'not current'):
                                return u'0'
                            if (smoking_history == 'current'):
                                return u'0'
                            if (smoking_history == 'former'):
                                return u'0'
                            if (smoking_history == 'ever'):
                                return u'0'
                        if (gender != 'Female'):
                            if (bmi <= 26.15165):
                                if (bmi <= 25.4145):
                                    return u'0'
                                if (bmi > 25.4145):
                                    return u'0'
                            if (bmi > 26.15165):
                                return u'0'
        if (age > 32.5):
            if (age <= 44.5):
                if (bmi is None):
                    return u'0'
                if (bmi <= 45.38261):
                    if (smoking_history is None):
                        return u'0'
                    if (smoking_history == 'never'):
                        if (bmi <= 22.82643):
                            return u'0'
                        if (bmi > 22.82643):
                            if (age <= 35.5):
                                return u'0'
                            if (age > 35.5):
                                if (age <= 39.5):
                                    return u'0'
                                if (age > 39.5):
                                    if (bmi <= 25.14654):
                                        return u'0'
                                    if (bmi > 25.14654):
                                        if (bmi <= 39.79866):
                                            return u'0'
                                        if (bmi > 39.79866):
                                            return u'0'
                    if (smoking_history != 'never'):
                        if (bmi <= 24.49902):
                            return u'0'
                        if (bmi > 24.49902):
                            if (gender is None):
                                return u'0'
                            if (gender == 'Female'):
                                if (heart_disease is None):
                                    return u'0'
                                if (heart_disease == '1'):
                                    return u'0'
                                if (heart_disease == '0'):
                                    if (age <= 41.5):
                                        if (bmi <= 42.91536):
                                            return u'0'
                                        if (bmi > 42.91536):
                                            return u'0'
                                    if (age > 41.5):
                                        return u'0'
                            if (gender != 'Female'):
                                if (bmi <= 41.55607):
                                    return u'0'
                                if (bmi > 41.55607):
                                    return u'0'
                if (bmi > 45.38261):
                    return u'0'
            if (age > 44.5):
                if (diabetes is None):
                    return u'0'
                if (diabetes == '1'):
                    if (gender is None):
                        return u'0'
                    if (gender == 'Male'):
                        return u'0'
                    if (gender == 'Female'):
                        return u'0'
                if (diabetes == '0'):
                    if (heart_disease is None):
                        return u'0'
                    if (heart_disease == '1'):
                        return u'0'
                    if (heart_disease == '0'):
                        if (hypertension is None):
                            return u'0'
                        if (hypertension == '1'):
                            return u'0'
                        if (hypertension == '0'):
                            if (bmi is None):
                                return u'0'
                            if (bmi <= 20.21586):
                                return u'0'
                            if (bmi > 20.21586):
                                if (age <= 50.5):
                                    if (age <= 48.5):
                                        if (bmi <= 26.96264):
                                            return u'0'
                                        if (bmi > 26.96264):
                                            return u'0'
                                    if (age > 48.5):
                                        if (smoking_history is None):
                                            return u'0'
                                        if (smoking_history == 'current'):
                                            return u'0'
                                        if (smoking_history != 'current'):
                                            return u'0'
                                if (age > 50.5):
                                    if (smoking_history is None):
                                        return u'0'
                                    if (smoking_history == 'never'):
                                        if (bmi <= 37.32107):
                                            return u'0'
                                        if (bmi > 37.32107):
                                            return u'0'
                                    if (smoking_history == 'not current'):
                                        return u'0'
                                    if (smoking_history == 'current'):
                                        return u'0'
                                    if (smoking_history == 'former'):
                                        return u'0'
                                    if (smoking_history == 'ever'):
                                        return u'0'
    if (age > 54.5):
        if (age <= 71.5):
            if (diabetes is None):
                return u'0'
            if (diabetes == '1'):
                if (heart_disease is None):
                    return u'0'
                if (heart_disease == '1'):
                    if (smoking_history is None):
                        return u'0'
                    if (smoking_history == 'current'):
                        if (bmi is None):
                            return u'0'
                        if (bmi <= 24.325):
                            if (gender is None):
                                return u'1'
                            if (gender == 'Male'):
                                return u'0'
                            if (gender == 'Female'):
                                return u'1'
                        if (bmi > 24.325):
                            return u'0'
                    if (smoking_history != 'current'):
                        return u'0'
                if (heart_disease == '0'):
                    if (age <= 68.5):
                        if (bmi is None):
                            return u'0'
                        if (bmi <= 31.18445):
                            return u'0'
                        if (bmi > 31.18445):
                            if (smoking_history is None):
                                return u'0'
                            if (smoking_history == 'current'):
                                return u'0'
                            if (smoking_history != 'current'):
                                if (age <= 66.5):
                                    return u'0'
                                if (age > 66.5):
                                    return u'0'
                    if (age > 68.5):
                        if (smoking_history is None):
                            return u'0'
                        if (smoking_history == 'current'):
                            if (bmi is None):
                                return u'0'
                            if (bmi <= 21.33):
                                return u'1'
                            if (bmi > 21.33):
                                return u'0'
                        if (smoking_history != 'current'):
                            return u'0'
            if (diabetes == '0'):
                if (heart_disease is None):
                    return u'0'
                if (heart_disease == '1'):
                    if (smoking_history is None):
                        return u'0'
                    if (smoking_history == 'not current'):
                        return u'0'
                    if (smoking_history != 'not current'):
                        return u'0'
                if (heart_disease == '0'):
                    if (age <= 65.5):
                        if (gender is None):
                            return u'0'
                        if (gender == 'Other'):
                            return u'0'
                        if (gender == 'Male'):
                            if (smoking_history is None):
                                return u'0'
                            if (smoking_history == 'never'):
                                if (age <= 62.5):
                                    if (bmi is None):
                                        return u'0'
                                    if (bmi <= 27.87511):
                                        return u'0'
                                    if (bmi > 27.87511):
                                        return u'0'
                                if (age > 62.5):
                                    return u'0'
                            if (smoking_history != 'never'):
                                if (bmi is None):
                                    return u'0'
                                if (bmi <= 42.59625):
                                    if (bmi <= 24.75744):
                                        return u'0'
                                    if (bmi > 24.75744):
                                        if (smoking_history == 'not current'):
                                            return u'0'
                                        if (smoking_history != 'not current'):
                                            return u'0'
                                if (bmi > 42.59625):
                                    return u'0'
                        if (gender == 'Female'):
                            if (smoking_history is None):
                                return u'0'
                            if (smoking_history == 'current'):
                                return u'0'
                            if (smoking_history != 'current'):
                                if (bmi is None):
                                    return u'0'
                                if (bmi <= 22.79801):
                                    return u'0'
                                if (bmi > 22.79801):
                                    if (bmi <= 25.41177):
                                        return u'0'
                                    if (bmi > 25.41177):
                                        if (bmi <= 26.34938):
                                            return u'0'
                                        if (bmi > 26.34938):
                                            return u'0'
                    if (age > 65.5):
                        if (smoking_history is None):
                            return u'0'
                        if (smoking_history == 'never'):
                            if (bmi is None):
                                return u'0'
                            if (bmi <= 27.57145):
                                return u'0'
                            if (bmi > 27.57145):
                                return u'0'
                        if (smoking_history != 'never'):
                            if (bmi is None):
                                return u'0'
                            if (bmi <= 40.76196):
                                if (hypertension is None):
                                    return u'0'
                                if (hypertension == '1'):
                                    return u'0'
                                if (hypertension == '0'):
                                    if (bmi <= 19.58733):
                                        return u'0'
                                    if (bmi > 19.58733):
                                        if (smoking_history == 'current'):
                                            return u'0'
                                        if (smoking_history != 'current'):
                                            return u'0'
                            if (bmi > 40.76196):
                                return u'0'
        if (age > 71.5):
            if (hypertension is None):
                return u'0'
            if (hypertension == '1'):
                if (age <= 78.5):
                    if (bmi is None):
                        return u'0'
                    if (bmi <= 26.93574):
                        return u'0'
                    if (bmi > 26.93574):
                        return u'0'
                if (age > 78.5):
                    if (bmi is None):
                        return u'0'
                    if (bmi <= 18.54339):
                        return u'0'
                    if (bmi > 18.54339):
                        if (bmi <= 43.09167):
                            if (bmi <= 36.42107):
                                if (smoking_history is None):
                                    return u'0'
                                if (smoking_history == 'current'):
                                    return u'0'
                                if (smoking_history != 'current'):
                                    return u'0'
                            if (bmi > 36.42107):
                                return u'0'
                        if (bmi > 43.09167):
                            if (bmi <= 43.495):
                                return u'1'
                            if (bmi > 43.495):
                                return u'0'
            if (hypertension == '0'):
                if (heart_disease is None):
                    return u'0'
                if (heart_disease == '1'):
                    if (bmi is None):
                        return u'0'
                    if (bmi <= 14.655):
                        return u'1'
                    if (bmi > 14.655):
                        if (bmi <= 21.53346):
                            if (age <= 72.5):
                                return u'1'
                            if (age > 72.5):
                                return u'0'
                        if (bmi > 21.53346):
                            return u'0'
                if (heart_disease == '0'):
                    if (age <= 78.5):
                        if (diabetes is None):
                            return u'0'
                        if (diabetes == '1'):
                            return u'0'
                        if (diabetes == '0'):
                            if (smoking_history is None):
                                return u'0'
                            if (smoking_history == 'never'):
                                return u'0'
                            if (smoking_history != 'never'):
                                if (gender is None):
                                    return u'0'
                                if (gender == 'Male'):
                                    return u'0'
                                if (gender == 'Female'):
                                    if (bmi is None):
                                        return u'0'
                                    if (bmi <= 28.89249):
                                        return u'0'
                                    if (bmi > 28.89249):
                                        return u'0'
                    if (age > 78.5):
                        if (smoking_history is None):
                            return u'0'
                        if (smoking_history == 'never'):
                            if (bmi is None):
                                return u'0'
                            if (bmi <= 43.3075):
                                if (bmi <= 19.4845):
                                    return u'0'
                                if (bmi > 19.4845):
                                    if (bmi <= 36.57679):
                                        if (bmi <= 35.36143):
                                            return u'0'
                                        if (bmi > 35.36143):
                                            return u'0'
                                    if (bmi > 36.57679):
                                        return u'0'
                            if (bmi > 43.3075):
                                if (bmi <= 46.6):
                                    return u'1'
                                if (bmi > 46.6):
                                    return u'0'
                        if (smoking_history != 'never'):
                            if (bmi is None):
                                return u'0'
                            if (bmi <= 23.70524):
                                return u'0'
                            if (bmi > 23.70524):
                                return u'0'
                            
def predict_diabetes(gender=None,
                 age=None,
                 hypertension=None,
                 stroke=None,
                 heart_disease=None,
                 smoking_history=None,
                 bmi=None):
    """ Predictor for diabetes from model/54fa4dc7af447f278e000083
    
        This is a random sample of the approximately 6 million patient records from GE Medical Quality Improvement Consortium (MQIC) database. 
        Source:
        - http://www.visualizing.org/datasets/mqic-patient-data-100k-sample[*]
        [*]http://www.visualizing.org/datasets/mqic-patient-data-100k-sample: http://www.visualizing.org/datasets/mqic-patient-data-100k-sample
    """
    if (age is None):
        return u'0'
    if (age > 44.47595):
        if (bmi is None):
            return u'0'
        if (bmi > 31.24745):
            if (age > 54.5):
                if (bmi > 38.16475):
                    if (heart_disease is None):
                        return u'0'
                    if (heart_disease == '0'):
                        if (hypertension is None):
                            return u'0'
                        if (hypertension == '0'):
                            if (bmi > 41.7455):
                                if (smoking_history is None):
                                    return u'0'
                                if (smoking_history == 'never'):
                                    return u'0'
                                if (smoking_history != 'never'):
                                    if (age > 55.5):
                                        if (age > 62.5):
                                            return u'1'
                                        if (age <= 62.5):
                                            return u'0'
                                    if (age <= 55.5):
                                        return u'1'
                            if (bmi <= 41.7455):
                                if (age > 69.5):
                                    return u'0'
                                if (age <= 69.5):
                                    if (age > 60.5):
                                        if (smoking_history is None):
                                            return u'0'
                                        if (smoking_history == 'not current'):
                                            return u'0'
                                        if (smoking_history != 'not current'):
                                            return u'0'
                                    if (age <= 60.5):
                                        if (smoking_history is None):
                                            return u'0'
                                        if (smoking_history == 'ever'):
                                            return u'0'
                                        if (smoking_history != 'ever'):
                                            return u'0'
                        if (hypertension != '0'):
                            if (age > 59.5):
                                return u'1'
                            if (age <= 59.5):
                                return u'0'
                    if (heart_disease != '0'):
                        if (bmi > 64.815):
                            return u'0'
                        if (bmi <= 64.815):
                            return u'1'
                if (bmi <= 38.16475):
                    if (heart_disease is None):
                        return u'0'
                    if (heart_disease == '0'):
                        if (hypertension is None):
                            return u'0'
                        if (hypertension == '0'):
                            if (age > 61.5):
                                if (bmi > 33.85739):
                                    if (age > 79.5):
                                        return u'0'
                                    if (age <= 79.5):
                                        return u'0'
                                if (bmi <= 33.85739):
                                    if (gender is None):
                                        return u'0'
                                    if (gender == 'Female'):
                                        if (age > 69.5):
                                            if (smoking_history is None):
                                                return u'0'
                                            if (smoking_history == 'current'):
                                                return u'0'
                                            if (smoking_history != 'current'):
                                                return u'0'
                                        if (age <= 69.5):
                                            return u'0'
                                    if (gender != 'Female'):
                                        if (smoking_history is None):
                                            return u'0'
                                        if (smoking_history == 'current'):
                                            return u'0'
                                        if (smoking_history != 'current'):
                                            return u'0'
                            if (age <= 61.5):
                                if (bmi > 32.98416):
                                    if (bmi > 35.92538):
                                        return u'0'
                                    if (bmi <= 35.92538):
                                        return u'0'
                                if (bmi <= 32.98416):
                                    return u'0'
                        if (hypertension != '0'):
                            if (bmi > 33.03057):
                                if (bmi > 38.04156):
                                    return u'1'
                                if (bmi <= 38.04156):
                                    if (smoking_history is None):
                                        return u'0'
                                    if (smoking_history == 'not current'):
                                        return u'1'
                                    if (smoking_history != 'not current'):
                                        return u'0'
                            if (bmi <= 33.03057):
                                return u'0'
                    if (heart_disease != '0'):
                        return u'0'
            if (age <= 54.5):
                if (bmi > 39.43203):
                    if (hypertension is None):
                        return u'0'
                    if (hypertension == '0'):
                        return u'0'
                    if (hypertension != '0'):
                        return u'0'
                if (bmi <= 39.43203):
                    if (hypertension is None):
                        return u'0'
                    if (hypertension == '0'):
                        if (heart_disease is None):
                            return u'0'
                        if (heart_disease == '0'):
                            if (age > 51.5):
                                return u'0'
                            if (age <= 51.5):
                                if (stroke is None):
                                    return u'0'
                                if (stroke == '0'):
                                    if (bmi > 32.38317):
                                        if (gender is None):
                                            return u'0'
                                        if (gender == 'Male'):
                                            if (smoking_history is None):
                                                return u'0'
                                            if (smoking_history == 'not current'):
                                                return u'0'
                                            if (smoking_history != 'not current'):
                                                return u'0'
                                        if (gender != 'Male'):
                                            return u'0'
                                    if (bmi <= 32.38317):
                                        return u'0'
                                if (stroke != '0'):
                                    return u'0'
                        if (heart_disease != '0'):
                            return u'0'
                    if (hypertension != '0'):
                        return u'0'
        if (bmi <= 31.24745):
            if (age > 64.5):
                if (bmi > 24.55329):
                    if (heart_disease is None):
                        return u'0'
                    if (heart_disease == '0'):
                        if (hypertension is None):
                            return u'0'
                        if (hypertension == '0'):
                            if (bmi > 27.96884):
                                if (bmi > 30.71435):
                                    return u'0'
                                if (bmi <= 30.71435):
                                    if (gender is None):
                                        return u'0'
                                    if (gender == 'Female'):
                                        return u'0'
                                    if (gender != 'Female'):
                                        return u'0'
                            if (bmi <= 27.96884):
                                if (age > 70.5):
                                    if (stroke is None):
                                        return u'0'
                                    if (stroke == '0'):
                                        if (smoking_history is None):
                                            return u'0'
                                        if (smoking_history == 'not current'):
                                            return u'0'
                                        if (smoking_history != 'not current'):
                                            if (age > 74.5):
                                                return u'0'
                                            if (age <= 74.5):
                                                return u'0'
                                    if (stroke != '0'):
                                        return u'0'
                                if (age <= 70.5):
                                    return u'0'
                        if (hypertension != '0'):
                            if (bmi > 29.42536):
                                return u'0'
                            if (bmi <= 29.42536):
                                return u'0'
                    if (heart_disease != '0'):
                        return u'0'
                if (bmi <= 24.55329):
                    if (hypertension is None):
                        return u'0'
                    if (hypertension == '0'):
                        if (heart_disease is None):
                            return u'0'
                        if (heart_disease == '0'):
                            if (age > 68.5):
                                if (gender is None):
                                    return u'0'
                                if (gender == 'Female'):
                                    if (age > 77.5):
                                        if (smoking_history is None):
                                            return u'0'
                                        if (smoking_history == 'never'):
                                            return u'0'
                                        if (smoking_history != 'never'):
                                            return u'0'
                                    if (age <= 77.5):
                                        return u'0'
                                if (gender != 'Female'):
                                    return u'0'
                            if (age <= 68.5):
                                return u'0'
                        if (heart_disease != '0'):
                            return u'0'
                    if (hypertension != '0'):
                        if (smoking_history is None):
                            return u'0'
                        if (smoking_history == 'former'):
                            return u'0'
                        if (smoking_history != 'former'):
                            return u'0'
            if (age <= 64.5):
                if (bmi > 26.63):
                    if (hypertension is None):
                        return u'0'
                    if (hypertension == '0'):
                        if (age > 53.5):
                            if (heart_disease is None):
                                return u'0'
                            if (heart_disease == '0'):
                                if (gender is None):
                                    return u'0'
                                if (gender == 'Female'):
                                    if (smoking_history is None):
                                        return u'0'
                                    if (smoking_history == 'current'):
                                        return u'0'
                                    if (smoking_history != 'current'):
                                        return u'0'
                                if (gender != 'Female'):
                                    if (bmi > 26.76701):
                                        if (bmi > 30.46288):
                                            return u'0'
                                        if (bmi <= 30.46288):
                                            if (smoking_history is None):
                                                return u'0'
                                            if (smoking_history == 'never'):
                                                return u'0'
                                            if (smoking_history != 'never'):
                                                return u'0'
                                    if (bmi <= 26.76701):
                                        return u'0'
                            if (heart_disease != '0'):
                                return u'0'
                        if (age <= 53.5):
                            if (bmi > 29.09381):
                                if (smoking_history is None):
                                    return u'0'
                                if (smoking_history == 'current'):
                                    return u'0'
                                if (smoking_history != 'current'):
                                    return u'0'
                            if (bmi <= 29.09381):
                                if (bmi > 29.03167):
                                    return u'0'
                                if (bmi <= 29.03167):
                                    if (gender is None):
                                        return u'0'
                                    if (gender == 'Female'):
                                        if (smoking_history is None):
                                            return u'0'
                                        if (smoking_history == 'current'):
                                            return u'0'
                                        if (smoking_history != 'current'):
                                            return u'0'
                                    if (gender != 'Female'):
                                        return u'0'
                    if (hypertension != '0'):
                        return u'0'
                if (bmi <= 26.63):
                    if (heart_disease is None):
                        return u'0'
                    if (heart_disease == '0'):
                        if (gender is None):
                            return u'0'
                        if (gender == 'Female'):
                            if (age > 53.5):
                                if (bmi > 25.16394):
                                    return u'0'
                                if (bmi <= 25.16394):
                                    if (smoking_history is None):
                                        return u'0'
                                    if (smoking_history == 'never'):
                                        return u'0'
                                    if (smoking_history != 'never'):
                                        return u'0'
                            if (age <= 53.5):
                                if (age > 48.5):
                                    if (bmi > 14.31):
                                        if (bmi > 24.06261):
                                            return u'0'
                                        if (bmi <= 24.06261):
                                            return u'0'
                                    if (bmi <= 14.31):
                                        return u'1'
                                if (age <= 48.5):
                                    return u'0'
                        if (gender != 'Female'):
                            if (hypertension is None):
                                return u'0'
                            if (hypertension == '0'):
                                if (age > 52.5):
                                    if (smoking_history is None):
                                        return u'0'
                                    if (smoking_history == 'ever'):
                                        return u'0'
                                    if (smoking_history != 'ever'):
                                        return u'0'
                                if (age <= 52.5):
                                    return u'0'
                            if (hypertension != '0'):
                                return u'0'
                    if (heart_disease != '0'):
                        return u'0'
    if (age <= 44.47595):
        if (age > 26.49701):
            if (bmi is None):
                return u'0'
            if (bmi > 31.40179):
                if (hypertension is None):
                    return u'0'
                if (hypertension == '0'):
                    if (bmi > 36.4421):
                        if (age > 34.5):
                            if (bmi > 45.43461):
                                return u'0'
                            if (bmi <= 45.43461):
                                if (smoking_history is None):
                                    return u'0'
                                if (smoking_history == 'current'):
                                    return u'0'
                                if (smoking_history != 'current'):
                                    return u'0'
                        if (age <= 34.5):
                            if (smoking_history is None):
                                return u'0'
                            if (smoking_history == 'not current'):
                                return u'0'
                            if (smoking_history != 'not current'):
                                if (stroke is None):
                                    return u'0'
                                if (stroke == '0'):
                                    return u'0'
                                if (stroke != '0'):
                                    return u'1'
                    if (bmi <= 36.4421):
                        if (age > 36.5):
                            if (heart_disease is None):
                                return u'0'
                            if (heart_disease == '0'):
                                if (bmi > 35.76553):
                                    return u'0'
                                if (bmi <= 35.76553):
                                    if (age > 40.5):
                                        return u'0'
                                    if (age <= 40.5):
                                        return u'0'
                            if (heart_disease != '0'):
                                return u'0'
                        if (age <= 36.5):
                            if (smoking_history is None):
                                return u'0'
                            if (smoking_history == 'not current'):
                                return u'0'
                            if (smoking_history != 'not current'):
                                if (bmi > 36.08724):
                                    return u'0'
                                if (bmi <= 36.08724):
                                    return u'0'
                if (hypertension != '0'):
                    return u'0'
            if (bmi <= 31.40179):
                if (hypertension is None):
                    return u'0'
                if (hypertension == '0'):
                    if (age > 34.5):
                        if (bmi > 29.60307):
                            return u'0'
                        if (bmi <= 29.60307):
                            if (bmi > 15.65812):
                                if (heart_disease is None):
                                    return u'0'
                                if (heart_disease == '0'):
                                    if (bmi > 22.9981):
                                        if (bmi > 23.19604):
                                            if (bmi > 27.69345):
                                                if (bmi > 28.04766):
                                                    return u'0'
                                                if (bmi <= 28.04766):
                                                    return u'0'
                                            if (bmi <= 27.69345):
                                                if (bmi > 24.92962):
                                                    if (age > 37.5):
                                                        return u'0'
                                                    if (age <= 37.5):
                                                        return u'0'
                                                if (bmi <= 24.92962):
                                                    return u'0'
                                        if (bmi <= 23.19604):
                                            return u'0'
                                    if (bmi <= 22.9981):
                                        return u'0'
                                if (heart_disease != '0'):
                                    return u'0'
                            if (bmi <= 15.65812):
                                return u'0'
                    if (age <= 34.5):
                        if (bmi > 13.94667):
                            if (bmi > 21.07273):
                                if (bmi > 30.6811):
                                    return u'0'
                                if (bmi <= 30.6811):
                                    if (smoking_history is None):
                                        return u'0'
                                    if (smoking_history == 'former'):
                                        return u'0'
                                    if (smoking_history != 'former'):
                                        if (stroke is None):
                                            return u'0'
                                        if (stroke == '0'):
                                            if (bmi > 21.82414):
                                                if (bmi > 22.13004):
                                                    if (bmi > 27.72733):
                                                        return u'0'
                                                    if (bmi <= 27.72733):
                                                        return u'0'
                                                if (bmi <= 22.13004):
                                                    return u'0'
                                            if (bmi <= 21.82414):
                                                return u'0'
                                        if (stroke != '0'):
                                            return u'0'
                            if (bmi <= 21.07273):
                                return u'0'
                        if (bmi <= 13.94667):
                            return u'0'
                if (hypertension != '0'):
                    return u'0'
        if (age <= 26.49701):
            if (age > 3.5):
                if (age > 12.5):
                    if (gender is None):
                        return u'0'
                    if (gender == 'Male'):
                        if (bmi is None):
                            return u'0'
                        if (bmi > 18.85424):
                            if (age > 24.5):
                                return u'0'
                            if (age <= 24.5):
                                if (smoking_history is None):
                                    return u'0'
                                if (smoking_history == 'not current'):
                                    return u'0'
                                if (smoking_history != 'not current'):
                                    if (smoking_history == 'former'):
                                        return u'0'
                                    if (smoking_history != 'former'):
                                        if (age > 13.5):
                                            if (bmi > 36.896):
                                                return u'0'
                                            if (bmi <= 36.896):
                                                if (age > 14.5):
                                                    if (smoking_history == 'ever'):
                                                        return u'0'
                                                    if (smoking_history != 'ever'):
                                                        if (bmi > 19.49615):
                                                            if (bmi > 36.31575):
                                                                return u'0'
                                                            if (bmi <= 36.31575):
                                                                if (bmi > 29.02352):
                                                                    return u'0'
                                                                if (bmi <= 29.02352):
                                                                    return u'0'
                                                        if (bmi <= 19.49615):
                                                            return u'0'
                                                if (age <= 14.5):
                                                    return u'0'
                                        if (age <= 13.5):
                                            return u'0'
                        if (bmi <= 18.85424):
                            return u'0'
                    if (gender != 'Male'):
                        if (smoking_history is None):
                            return u'0'
                        if (smoking_history == 'not current'):
                            return u'0'
                        if (smoking_history != 'not current'):
                            if (smoking_history == 'current'):
                                return u'0'
                            if (smoking_history != 'current'):
                                if (age > 17.5):
                                    return u'0'
                                if (age <= 17.5):
                                    return u'0'
                if (age <= 12.5):
                    if (heart_disease is None):
                        return u'0'
                    if (heart_disease == '0'):
                        if (gender is None):
                            return u'0'
                        if (gender == 'Female'):
                            return u'0'
                        if (gender != 'Female'):
                            return u'0'
                    if (heart_disease != '0'):
                        return u'0'
            if (age <= 3.5):
                return u'0'