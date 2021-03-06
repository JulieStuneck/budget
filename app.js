			//BUDGET DATA MODULE
let budgetController = (function() { //IFFE begins here

	let Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {

		if(totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	let Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	}; 

	let calculateTotal = function(type) {
		let sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;//value from Expense or Income array, cur is current value in that array
		});
		data.totals[type] = sum;//put into object below
	};


	let data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1 //-1 is a value to say does not exist
	};

	return {
		addItem: function(type, des, val) { //(type=income or expense, description, value)
			let newItem, ID;

			//Create new ID - to be the last item in array + 1
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0; //to get things started s
			}
			
			//Create new item based on 'inc' or 'exp' type
			if(type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}
			
			//Push new item into data structure
			data.allItems[type].push(newItem);//will push to exp or inc array

			//return the new element
			return newItem;
		},

		deleteItem: function(type, id) {
			//find index of id that we want to remove (may not always be same as id)
			let ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) { //-1 means does not exist
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {

			//calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			//calculate budget: gets info from and stores it in data structure, above
			data.budget = data.totals.inc - data.totals.exp;

			//calculate percentage of income spent, when income > 0
			if(data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1; //non-existant
			}			
		},

		calculatePercentages: function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			let allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;
		},


		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		testing: function() {
			console.log(data);
		}
	};

})(); //IFFE budgetController ends here


			//UI CONTROLLER MODULE
let UIController = (function() { //begin IFFE

	let DOMstrings = {//central place for all querySelector strings
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	}

	 var formatNumber = function(num, type) {
	 	//+ or - before number; 2 decimal points; comma separating thousands
        var numSplit, int, dec, type;
        
        num = Math.abs(num); //abs removes sign of number - method of Math Object
        num = num.toFixed(2); //set 2 places after decimal. method of Number Prototype, JS converts primitive num to Number Object. Will add decimals and round up - returns a string

        numSplit = num.split('.'); //split num into two parts: integer & decimal. Returns an array

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        //type === 'exp' ? sign = '-' : sign = '+';
		//return type + ' ' + int + dec;
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

	let nodeListForEach = function(list, callback) {
			for (var i=0; i<list.length; i++) {
				callback(list[i], i); //(current, index) from below
			}
		};


	return {
		getinput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value, //Will be either income or expense
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)//converts string to number with decimal
			};			
		},

		addListItem: function(obj, type) {//the obj created in newItem
			let html, newHtml, element;

			//1. Create HTML string with placeholder text
			if (type ==='inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			} else if (type === 'exp') {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
			}
			
			//2. replace placehoder text with actual data received from object, can use all methods available to string objects
			newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			//3. Insert HTML into DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorID) {

			let el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			let fields, fieldsArr;
									//syntax is like CSS selecting
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

				//qSelAll returns a list. Cannot use array methods on a list. Need to convert to an array using slice - makes a copy of array that is called on - if put in a list, will return an array.need to call slice from the array prototype
			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {
				//current element being processed
				current.value = "";
			});

			fieldsArr[0].focus();//returns cursor to field input area
		},
								//obj generated in getBudget Method
		displayBudget: function(obj) {
			let type;
			obj.budget > 0 ? type = 'inc' : type = 'exp'; 

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
			

			if (obj.percentage > 0 ) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {

			let fields = document.querySelectorAll(DOMstrings.expensesPercLabel);		

			nodeListForEach(fields, function(current, index) {
				if(percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}				
			});
		},

		displayMonth: function() {
			let now, year, months, month;

			now = new Date(); //Date is an Object Constructor of JS
			//var christmas - new Date(2018, 11, 25) 0-based
			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();

			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
		},

		changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur) {
               cur.classList.toggle('red-focus'); 
         	});

         	document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

		getDOMstrings: function() {
			return DOMstrings;
		}
	};

})(); //end UIController IFFE



			//GLOBAL APP CONTROLLER - Connect Budget & UI
let controller = (function(budgetCtrl, UICtrl) { //pass the other two modules as arguments(below), so this module can connect them

	let setupEventListeners = function() {
		let DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		//allow enter-key as well as click
		document.addEventListener('keypress', function(event) { 
			if (event.keyCode === 13 || event.which === 13) { //event.which is for older browsers
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	let updateBudget = function() {
		//1. Calculate budget
		budgetCtrl.calculateBudget();

		//2. Return the budget
		let budget = budgetCtrl.getBudget();

		//3. Display budget on the UI
		UICtrl.displayBudget(budget);
	};

	let updatePercentages = function() {

		//1. Calculate percentages
		budgetCtrl.calculatePercentages();

		//2. Read percentages from the budget controller
		let percentages = budgetCtrl.getPercentages();

		//3. Update UI with new percentages
		UICtrl.displayPercentages(percentages);
	};

	//ctrlAddItem is control center - tells the other modules what to do and gets data back to use for othr things
	let ctrlAddItem = function() {
		let input, newItem

		//1. Get field input data
		input = UICtrl.getinput();
		//console.log(input); //testing

		if(input.description !== '' && !isNaN(input.value) && input.value > 0) {
			//2. Add item to budget controller
			newItem = budgetController.addItem(input.type, input.description, input.value);

			//3. Add new item to UI
			UICtrl.addListItem(newItem, input.type);

			//4. Clear the fields
			UICtrl.clearFields();	

			//5. Calculate ad update budget
			updateBudget();

			//6. Calculate and update percentages
			updatePercentages();
		}			
	};

	let ctrlDeleteItem = function(event) {
		let itemID, splitID, type, ID;

		//find the exact element that fired the event - bubbles up to container(great, great grandparent) element
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if(itemID) {//info is coded into html element as class, use this function to create an array from which we get the type and id of target

			//inc-1
			splitID = itemID.split('-');
            type = splitID[0];
			ID = parseInt(splitID[1]);

			//1. delete item from data structure
			budgetCtrl.deleteItem(type, ID);

			//2. delete item from user interface
			UICtrl.deleteListItem(itemID);

			//3. update and show new budget
			updateBudget();

			//4. Calculate and update percentages
			updatePercentages();
		}
	};

	return {
		init: function() {
			console.log('App has started.');
			UICtrl.displayMonth();
			UICtrl.displayBudget({ //set everything to 0 on start
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController, UIController); //end controller IFFE. Call the controller function with the parameters defined

controller.init(); //only line of code outside a controller
