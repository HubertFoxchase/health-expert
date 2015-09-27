'use strict';

angular.module("values", [])
.value(
		'groupsOfSymptoms', 
	    [
	     	{
	     		name: 'Common Symptoms',
	     		symptoms : [
	    	                {
	    	                    name: 'Cough',
	    	                    id: 's_102'
	    	                },
	    	                {
	    	                    name: 'Fever',
	    	                    id: 's_98'
	    	                },	
	       	                {
	    	                    name: 'Chills',
	    	                    id: 's_81'
	    	                },	 	    	                
	    	                {
	    	                    name: 'Nausea',
	    	                    id: 's_156'
	    	                },
	    	                {
	    	                	name: 'Vomiting',
	    	                	id: 's_305'
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
	            name: 'Skin Symptoms',
	            symptoms: [
  	                {
	                    name: 'Skin lesions',
	                    id: 's_241'
	                },

	                {
	                    name: 'Itching skin',
	                    id: 's_254'
	                },
	                {
	                    name: 'Rush',
	                    id: 's_417'
	                },
   	                {
	                    name: 'Red spots',
	                    id: 's_234'
	                },
	                {
	                    name: 'Red skin',
	                    id: 's_229'
	                }
	            ]
	        },
	        {
	            name: 'Pshycological Symptoms',
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
	            deadEnd :  true,
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
.value(
		'body', 
	    [
	     	{
	     		name: 'Head',
	     		parts : [
	     		         {
	     		        	 name : "Head",
	     		        	 symptoms : [
     		       	                {
	     		   	                    name: 'Headache',
	     		   	                    id: 's_21'
	     		   	                },
     		       	                {
	     		   	                    name: 'Head drop',
	     		   	                    id: 's_191'
	     		   	                },
     		       	                {
	     		   	                    name: 'Head tremors',
	     		   	                    id: 's_85'
	     		   	                },	     	
	     		   	         ]
	     		         },
	     		         {
	     		        	 name : "Face",
	     		        	 symptoms : [
     		       	                {
	     		   	                    name: 'Numbness or muscle spasms',
	     		   	                    id: 's_82'
	     		   	                },
     		       	                {
	     		   	                    name: 'Facial pain',
	     		   	                    id: 's_478'
	     		   	                }
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Eyes",
	     		        	 symptoms : [
     		       	                {
	     		   	                    name: 'Red eye',
	     		   	                    id: 's_492'
	     		   	                },
     		       	                {
	     		   	                    name: 'Scratched eyes',
	     		   	                    id: 's_498'
	     		   	                }
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Ears",
	     		        	 symptoms : [
	     		    	            {
	     		   	                    name: 'Earache',
	     		   	                    id: 's_47'
	     		   	                }
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Nose",
	     		        	 symptoms : [
     		    	                {
	     		   	                    name: 'Blocked nose',
	     		   	                    id: 's_331'
	     		   	                }
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Mouth",
	     		        	 symptoms : [
     		       	                {
	     		   	                    name: 'Blisters or sores',
	     		   	                    id: 's_694'
	     		   	                },
     		       	                {
	     		   	                    name: 'Dry mouth',
	     		   	                    id: 's_247'
	     		   	                },
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Throat",
	     		        	 symptoms : [
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
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Jaw",
	     		        	 symptoms : [
 	     		   	                {
	     		   	                    name: 'Jaw pain',
	     		   	                    id: 's_430'
	     		   	                },
 	     		   	                {
	     		   	                    name: 'Jaw locking',
	     		   	                    id: 's_428'
	     		   	                }
 	     		   	           
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Neck",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Swollen Neck',
	     		   					    id: 's_363'
	     		   					}
	     		        	 ]
	     		         }
	     		]
	     	},
	     	{
	     		name : "Chest / Upper back",
	     		parts : [
	     		         {
	     		        	 name : "Chest",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Chest pain',
	     		   					    id: 's_50'
	     		   					},
     		    					{
	     		   					    name: 'Heartburn',
	     		   					    id: 's_338'
	     		   					}	     		   					
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Heart",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Heart palpitations',
	     		   					    id: 's_110'
	     		   					},
     		    					{
	     		   					    name: 'Slow heart rate',
	     		   					    id: 's_534'
	     		   					},
     		    					{
	     		   					    name: 'Fast heart rate',
	     		   					    id: 's_261'
	     		   					}
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Upper back",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Back pain',
	     		   					    id: 's_1190'
	     		   					},
     		    					{
	     		   					    name: 'Stiff back in the morning',
	     		   					    id: 's_257'
	     		   					}
	     		        	 ]
	     		         }
	     		]
	     	},
	     	{
	     		name : "Abdomen / Lower back",
	     		parts : [
	     		         {
	     		        	 name : "Abdomen",
	     		        	 symptoms : [
     		     		         	{
     	 		   					    name: 'Abdominal pain',
     	 		   					    id: 's_13'
     	 		   					},
     		    					{
     	 		   					    name: 'Bloating',
     	 		   					    id: 's_309'
     	 		   					},
     		    					{
     	 		   					    name: 'Constipation',
     	 		   					    id: 's_329'
     	 		   					},
     		    					{
     	 		   					    name: 'Diarrhea',
     	 		   					    id: 's_8'
     	 		   					},
     		    					{
     	 		   					    name: 'Blood in stool',
     	 		   					    id: 's_112'
     	 		   					}
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Urinary tract",
	     		        	 symptoms : [
     		     		         	{
     	 		   					    name: 'Pain while urinating',
     	 		   					    id: 's_39'
     	 		   					},
     		    					{
     	 		   					    name: 'Blood in urine',
     	 		   					    id: 's_309'
     	 		   					},
     		    					{
     	 		   					    name: 'Dark urine',
     	 		   					    id: '611'
     	 		   					},
     		    					{
     	 		   					    name: 'Difficulty urinating',
     	 		   					    id: 's_264'
     	 		   					},
     		    					{
     	 		   					    name: 'Frequent urination',
     	 		   					    id: 's_215'
     	 		   					},
     		    					{
     	 		   					    name: 'Incontinence',
     	 		   					    id: 's_153'
     	 		   					}
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Lower back",
	     		        	 symptoms : [
     		     		         	{
     	 		   					    name: 'Back pain',
     	 		   					    id: 's_53'
     	 		   					}
	     		        	 ]
	     		         }
	     		]
	     	},
	     	{
	     		name : "Legs",
	     		parts : [
	     		         {
	     		        	 name : "Upper legs",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Lack of strength',
	     		   					    id: 's_743'
	     		   					}
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Lower legs",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Swelling',
	     		   					    id: 's_173'
	     		   					},
     		    					{
	     		   					    name: 'Lack of strength',
	     		   					    id: 's_743'
	     		   					},
     		    					{
	     		   					    name: 'Muscle spasm',
	     		   					    id: 's_117'
	     		   					},
     		    					{
	     		   					    name: 'Calf pain while walking',
	     		   					    id: 's_232'
	     		   					}
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Knees",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Swelling & pain',
	     		   					    id: 's_171'
	     		   					}
	     		        	 ]
	     		         },
	     		         {
	     		        	 name : "Feet",
	     		        	 symptoms : [
     		    					{
	     		   					    name: 'Foot joint pain',
	     		   					    id: 's_578'
	     		   					},
     		    					{
	     		   					    name: 'Swelling around ankles',
	     		   					    id: 's_1124'
	     		   					},
     		    					{
	     		   					    name: 'Cold hands and feet',
	     		   					    id: 's_408'
	     		   					},
     		    					{
	     		   					    name: 'Cold sensitivity',
	     		   					    id: 's_296'
	     		   					},	     		        	 
     		    					{
	     		   					    name: 'Tingling and Numbness',
	     		   					    id: 's_1063'
	     		   					}	     		        	 
	     		   			]
	     		         }
	     		         
 		   		]
	     	},
	     	{
	     		name : "Arms",
	     		parts : [
     		         {
     		        	 name : "Upper arm",
     		        	 symptoms : [
     		        	 ]
     		         },
     		         {
     		        	 name : "Forearm",
     		        	 symptoms : [
  		    					{
     		   					    name: 'Loss of sensation in one arm',
     		   					    id: 's_1063'
     		   					},	     		        	 
  		    					{
     		   					    name: 'Loss of sensation in both arms',
     		   					    id: 's_972'
     		   					}	     		
     		   					
     		        	 ]
     		         },
     		         {
     		        	 name : "Hand",
     		        	 symptoms : [
     		        	 ]
     		         },
     		         
	     		]
	     	}
	     	
	    ]
)
