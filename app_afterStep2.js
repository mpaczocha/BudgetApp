//Budget Controller
var budgetController = (function () {

   var Expense = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   var Income = function (id, description, value) {
      this.id = id;
      this.description = description;
      this.value = value;
   };

   var calculateTotal = function (type) {
      var sum = 0;
      data.allItems[type].forEach(function (cur) {
         sum += cur.value;
      });
      data.totals[type] = sum;
   };

   var data = {
      allItems: {
         exp: [],
         inc: []
      },
      totals: {
         exp: 0,
         inc: 0
      },
      budget: 0,
      percentage: -1
   };

   return {
      addItem: function (type, des, val) {
         var newItem, ID;

         //[1 2 3 4 5], next ID = 6
         //[1 2 4 6 8], next ID = 9
         //ID = last ID +1

         //Create new ID
         if (data.allItems[type].length > 0) {
            ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
         } else {
            ID = 0;
         }

         //Create new item based on 'inc' or 'exp' tpe
         if (type === 'exp') {
            newItem = new Expense(ID, des, val);
         } else if (type === 'inc') {
            newItem = new Income(ID, des, val);
         }

         //Push it into our data structure
         data.allItems[type].push(newItem);

         //Return the new element
         return newItem;
      },
      deleteItem: function (type, id) {
         var ids, index;

         //id = 6
         //data.allItems[type][id];
         //ids = [1 2 4 6 8]
         //index = 3

         //Map method is similar to the forEach method but map method returns a brand new array
         ids = data.allItems[type].map(function (current) {
            return current.id;
         });

         index = ids.indexOf(id);

         if (index !== -1) {
            data.allItems[type].splice(index, 1);
         }

      },
      calculateBudget: function () {
         //calculate total income and expenses 
         calculateTotal('exp');
         calculateTotal('inc');

         //calculate the budget: income - expenses
         data.budget = data.totals.inc - data.totals.exp;

         //calculate the percentage of income that we spent
         if (data.totals.inc > 0) {
            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
         } else {
            data.percentage = -1;
         }

      },
      getBudget: function () {
         return {
            budget: data.budget,
            totalInc: data.totals.inc,
            totalExp: data.totals.exp,
            percentage: data.percentage
         }
      },
      testing: function () {
         console.log(data);
      }
   };

})();

//UI Controller
var UIController = (function () {

   var DOMstrings = {
      inputType: '.add__type',
      inputDecsription: '.add__description',
      inputValue: '.add__value',
      inputBtn: '.add__btn',
      incomeContainer: '.income__list',
      expensesContainer: '.expenses__list',
      budgetLabel: '.budget__value',
      incomeLabel: '.budget__income--value',
      expensesLabel: '.budget__expenses--value',
      percentageLabel: '.budget__expenses--percentage',
      container: '.container'
   };

   return {
      getInput: function () {
         return {
            type: document.querySelector(DOMstrings.inputType).value, //Will be either inc or exp
            description: document.querySelector(DOMstrings.inputDecsription).value,
            value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
         }
      },
      addListItem: function (obj, type) {
         var html, newHtml, element;

         // Create HTML string with placeholder text
         if (type === 'inc') {
            element = DOMstrings.incomeContainer;
            html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
         } else {
            element = DOMstrings.expensesContainer;
            html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
         }

         // Replace the placeholder text with some actual data
         newHtml = html.replace('%id%', obj.id);
         newHtml = newHtml.replace('%description%', obj.description);
         newHtml = newHtml.replace('%value%', obj.value);

         //Insert the HTML into the DOM
         document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
      },
      //We will pass to the function deleteListItem itemID argument as selectorID
      deleteListItem: function (selectorID) {
         var el = document.getElementById(selectorID);

         //we can remove child element 'el' from the parent level
         el.parentNode.removeChild(el);
      },
      clearFields: function () {
         var fields, fieldsArr;

         //querySelectorAll return List instead of Array so we need to convert List to an Array in case of have all methods available in Array (second line below)
         fields = document.querySelectorAll(DOMstrings.inputDecsription + ', ' + DOMstrings.inputValue);

         fieldsArr = Array.prototype.slice.call(fields);

         fieldsArr.forEach(function (current, index, array) {
            current.value = "";
         });

         //Set up the focus on the first input - description
         fieldsArr[0].focus();
      },
      displayBudget: function (obj) {
         document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
         document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
         document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;

         if (obj.percentage > 0) {
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
         } else {
            document.querySelector(DOMstrings.percentageLabel).textContent = '---';
         }
      },
      getDOMstrings: function () {
         return DOMstrings;
      }
   };
})();

//Global App Controller
var controller = (function (budgetCtrl, UICtrl) {
   var setupEventListeners = function () {
      var DOM = UICtrl.getDOMstrings();

      //Callback function doesn't have to be the anonymous function, it can be specified function like above
      document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

      //When user wants to add income or expense with clicking enter (return) button on the keyboard (without clicking button like above). Then the 'keypress' event will occur not at specific element but on the global document = anywhere on the document
      document.addEventListener('keypress', function (event) {
         if (event.key === 'Enter') { //check if clicked key is enter
            ctrlAddItem();
         }
      });

      //In case of deleting incomes or expenses from the list that aren't available at the start of the application we use Event Delegation / Event Bubbling (we add event handler at the parent element of all the lists) and DOM Traversing(exactly in the ctrlDeleteItem method)
      document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
   };

   var updateBudget = function () {

      //1. Calculate the budget
      budgetCtrl.calculateBudget();

      //2. Return the budget
      var budget = budgetCtrl.getBudget();

      //3. Display the budget on the UI
      UICtrl.displayBudget(budget);

   };

   var ctrlAddItem = function () {
      var input, newItem;

      //1. Get the field input data
      input = UICtrl.getInput();

      if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

         //2. Add the item to the budget controller
         newItem = budgetCtrl.addItem(input.type, input.description, input.value);

         //3. Add the item to the UI
         UICtrl.addListItem(newItem, input.type);

         //4. Clear the fields
         UICtrl.clearFields();

         //5. Calculate and update budget;
         updateBudget();
      }
   };

   //Callback function of the addEventListener method has always access to the event object
   var ctrlDeleteItem = function (event) {
      var itemID, splitID, type, ID;

      //Only! List items (inc or exp) have id so we use this fact below
      itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

      if (itemID) {
         //ItemID format example: inc-1
         splitID = itemID.split('-');
         type = splitID[0];
         ID = parseInt(splitID[1]);

         //1. Delete item from the data structure
         budgetCtrl.deleteItem(type, ID);

         //2. Delete item from the UI
         UICtrl.deleteListItem(itemID);

         //3. Update and show the new budget
         updateBudget();
      }
   };

   return {
      init: function () {
         console.log('Application starts');
         UICtrl.displayBudget({
            budget: 0,
            totalInc: 0,
            totalExp: 0,
            percentage: -1
         });
         setupEventListeners();
      }
   };

})(budgetController, UIController);

controller.init();