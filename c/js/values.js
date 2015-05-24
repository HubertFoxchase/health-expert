'use strict';

angular.module("values", [])
.value(
		'groupsOfSymptoms', 
	    [
	        {
	            name: 'Pain',
	            symptoms: [
   	                {
	                    name: 'Headache',
	                    id: 's_21'
	                },
	                {
	                    name: 'Earache',
	                    id: 's_47'
	                },
	                {
	                    name: 'Jaw pain',
	                    id: 's_430'
	                },
	                {
	                    name: 'Chest pain',
	                    id: 's_50'
	                },
	                {
	                    name: 'Abdominal pain',
	                    id: 's_13'
	                },
	                {
	                    name: 'Back pain',
	                    id: 's_1190'
	                },
	                {
	                    name: 'Lower back pain',
	                    id: 's_53'
	                },
	                {
	                    name: 'Groin pain',
	                    id: 's_663'
	                },
	                {
	                    name: 'Leg pain',
	                    id: 's_579'
	                },
	                {
	                    name: 'Joint pain',
	                    id: 's_44'
	                }
	            ]
	        },
	        {
	            name: 'Flu-like symptoms',
	            symptoms: [
   	                {
	                    name: 'Chills',
	                    id: 's_81'
	                },	                
	                {
	                    name: 'Fever',
	                    id: 's_98'
	                },	
	            ]
	        },
	        {
	            name: 'Respiratory problems',
	            symptoms: [
	                {
	                    name: 'Cough',
	                    id: 's_102'
	                },
	                {
	                    name: 'Dry cough',
	                    id: 's_102'
	                },	                
	                {
	                    name: 'Chesty cough',
	                    id: 's_104'
	                },	                
	                {
	                    name: 'Sore throat',
	                    id: 's_20'
	                },
	                {
	                    name: 'Blocked nose',
	                    id: 's_331'
	                }
	            ]
	        },
	        {
	            name: 'Digestive problems',
	            symptoms: [
	                {
	                    name: 'Diarrhea',
	                    id: 's_8'
	                },
	                {
	                    name: 'Constipation',
	                    id: 's_329'
	                },
	                {
	                    name: 'Green stool',
	                    id: ''
	                },
	                {
	                    name: 'Bloody stool',
	                    id: 's_112'
	                },
	                {
	                    name: 'Nausea',
	                    id: 's_156'
	                },
	                {
	                    name: 'Bloating',
	                    id: 's_309'
	                }
	            ]
	        },
	        {
	            name: 'Skin problems',
	            symptoms: [
   	                {
	                    name: 'Itching skin',
	                    id: ''
	                },
   	                {
	                    name: 'Numbness',
	                    id: ''
	                },
   	                {
	                    name: 'Rush',
	                    id: ''
	                },
   	                {
	                    name: 'Red spots',
	                    id: 's_234'
	                },
   	                {
	                    name: 'Skin bumps',
	                    id: ''
	                },
	                {
	                    name: 'Red skin',
	                    id: 's_229'
	                }
	            ]
	        },
	        {
	            name: 'Pshycological problems',
	            symptoms: [
	                {
	                    name: 'Anxiety',
	                    id: 's_120'
	                }
	            ]
	        },
	        {
	            name: 'Swelling',
	            symptoms: [
					{
					    name: 'Swollen Neck',
					    id: 's_363'
					},
					{
					    name: 'Hand Swelling',
					    id: 's_1464'
					},
					{
					    name: 'Swelling',
					    id: 's_562'
					}
	            ]
	        },
	        {
	            name: 'Other',
	            symptoms: [
	                
	            ]
	        }
	    ]
)
.value(
		'groupsOfSymptoms2', 
	    [
	        {
	            name: 'Fever, weakness, feeling unwell',
	            symptoms: [
	                {
	                    name: 'Fever',
	                    id: 's_98'
	                },
	                {
	                    name: 'Shortness of breath',
	                    id: 's_88'
	                }
	            ]
	        },
	        {
	            name: 'Pain or discomfort',
	            symptoms: [
	                {
	                    name: 'Headache',
	                    id: 's_21'
	                },
	                {
	                    name: 'Earache',
	                    id: 's_47'
	                },
	                {
	                    name: 'Abdominal pain',
	                    id: 's_13'
	                },
	                {
	                    name: 'Chest pain',
	                    id: 's_50'
	                },
	                {
	                    name: 'Joint pain',
	                    id: 's_44'
	                }
	            ]
	        },
	        {
	            name: 'Respiratory problems',
	            symptoms: [
	                {
	                    name: 'Cough',
	                    id: 's_102'
	                },
	                {
	                    name: 'Sore throat',
	                    id: 's_20'
	                },
	                {
	                    name: 'Blocked nose',
	                    id: 's_331'
	                }
	            ]
	        },
	        {
	            name: 'Skin problems',
	            symptoms: [
	                {
	                    name: 'Red skin',
	                    id: 's_229'
	                }
	            ]
	        },
	        {
	            name: 'Pshycological problems',
	            symptoms: [
	                {
	                    name: 'Anxiety',
	                    id: 's_120'
	                }
	            ]
	        },
	        {
	            name: 'Other',
	            symptoms: [
	                
	            ]
	        }
	    ]
)