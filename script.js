// BUDGET CONTROLLER
var budgetController = (function () {

    // Function Constructors
    var Income = function(id, description, amount) {
        this.id = id;
        this.desc = description;
        this.amt = amount;
    }
    var Expense = function(id, description, amount) {
        this.id = id;
        this.desc = description;
        this.amt = amount;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function(totalIncome)  {
        if (totalIncome > 0)
            this.percentage =  Math.round(( this.amt / totalIncome ) * 100 );
        else
            this.percentage = -1;
    }
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }

    var computeTotal = type => {
        var sum = 0;

        data.allItems[type].forEach( item => {
            sum+= item.amt;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: (type, desc, amt) => {
            var newItem, ID;

            // Create new ID
            if ( data.allItems[type].length > 0)
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            else
                ID = 0;

            // Create income or expense object based on type
            if ( type === 'inc')
                newItem = new Income(ID, desc, amt);
            else if (type === 'exp')
                newItem = new Expense(ID, desc, amt);

            // Add item to the data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },
        calculateBudget: () => {

            // calculate the total income and expense
            computeTotal('inc');
            computeTotal('exp');

            // calculate the budget
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage
            if ( data.totals.inc > 0 )
                data.percentage = Math.round(data.totals.exp / data.totals.inc * 100);
            else
                data.percentage = -1;
        },

        calculatePercentages: () => {
            data.allItems.exp.forEach( item => {
                item.calcPercentage(data.totals.inc);
            })
        },

        getPercentages: () => {
            var percentages =  data.allItems.exp.map( item => {
                return item.getPercentage();
            })
            return percentages;
        },

        getBudget: () => {
            return {
                income: data.totals.inc,
                expense: data.totals.exp,
                budget: data.budget,
                percent: data.percentage
            }
        },
        removeItem: (type, id) => {
                var index, requiredArray;
                requiredArray = data.allItems[type];

                for (var i = 0 ; i < requiredArray.length ; i++) {
                    if ( requiredArray[i].id === id ){
                        index = i;
                        break;
                    }
                }
                data.allItems[type].splice(index, 1);
        }
    }

})();

// UI Controller

var UIController = (function () {

    var DOMElements = {
        inputDesc: document.querySelector('#input-desc'),
        inputAmt: document.querySelector('#input-amt'),
        addBtn: document.querySelector('#add-btn'),
        incomeContainer: document.querySelector('.list-container.income'),
        expenseContainer: document.querySelector('.list-container.expense'),
        budgetLabel: document.querySelector('#budget-amount'),
        incomeLabel: document.querySelector('#income-total'),
        expenseLabel: document.querySelector('#expense-total'),
        percentageLabel: document.querySelector('#budget-percentage'),
        container: document.querySelector('.cc-details-container'),
        date: document.querySelector('#month'),
        typeContainer: document.querySelector('.selector-wrapper')
    }

    var formatNumber = (num, type) => {
        num = num.toFixed(2);
        var parts = num.split('.');
        var int = parts[0];
        var r = '', i = int.length;
        if ( int.length > 3) {
            r = ',' + int.substr(int.length-3, 3);
            i -= 3;
            while( (i = i-2) > 0 ) 
                r = ',' + int.substr(i,2) + r;
            r = int.substr(0,i+2) + r;
        } else {
            r = int;
        }
        if ( type === 'inc')
            return '+ ' + r + '.' + parts[1]
        else
            return '- ' + r + '.' + parts[1]
    }

    var getActiveSelector = () => {
        return document.querySelector('.active-selector')
    }
    
    return {
        getDOMElements: DOMElements,
        getInput: () => {
            return {
                type: document.querySelector('.active-selector').classList.contains('income-selector') ? 'inc' : 'exp',
                desc: DOMElements.inputDesc.value,
                amount: parseFloat(DOMElements.inputAmt.value)
            }
        },
        insertNewItem: (object, type) => {
            var html, newHtml, element;
            
            // 1. Set the HTML with placeholder
            if ( type === 'inc'){
                html = `
                <div class="cc-list-item" id="inc-%id%">
                    <div class="row no-gutters">
                        <div class="col flex-grow-1">
                            <p class="cc-list-item-desc">%description%</p>
                        </div>
                        <div class="col text-right">
                            <p class="cc-list-item-amt income">%amount%</p>
                        </div>
                        <div class="text-right cc-cross-icon">
                            <span>
                                <i class="fas fa-times-circle" style="vertical-align: bottom;"></i>
                            </span>
                        </div>
                    </div>
                </div>`
                element = DOMElements.incomeContainer;
            } else if (type = 'exp') {
                html = `
                <div class="cc-list-item" id="exp-%id%">
                    <div class="row no-gutters">
                        <div class="col flex-grow-1">
                            <p class="cc-list-item-desc">%description%</p>
                        </div>
                        <div class="col text-right">
                            <p class="cc-list-item-amt expense">%amount% <span class="cc-percent-expense">45%</span></p>
                        </div>
                        <div class="text-right cc-cross-icon">
                            <span>
                                <i class="fas fa-times-circle" style="vertical-align: bottom;"></i>
                            </span>
                        </div>
                    </div>
                </div>
                `
                element = DOMElements.expenseContainer;
            }

            // 2. Replace the placeholder
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.desc);
            newHtml = newHtml.replace('%amount%', formatNumber(object.amt, type));

            // 3. Insert the item in the UI
            element.insertAdjacentHTML('beforeend', newHtml);

        },
        clearFields: () => {
            var fileds, fieldsArray;

            fields = document.querySelectorAll('.description-input, .amount-input');
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach( (current, index, array) => {
                current.value = '';
            });
            fieldsArray[0].focus();
        },
        displayMonth: () => {
            var now, months;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            now = new Date();
            DOMElements.date.textContent = months[now.getMonth()] + ', ' + now.getFullYear();
        },
        displayBudget: budgetObj => {
            var type = budgetObj.budget < 0 ? 'exp' : 'inc';
            DOMElements.budgetLabel.textContent = formatNumber(budgetObj.budget, type);
            DOMElements.incomeLabel.textContent = formatNumber(budgetObj.income, 'inc');
            DOMElements.expenseLabel.textContent = formatNumber(budgetObj.expense, 'exp');
            if (budgetObj.percent > 0 )
                DOMElements.percentageLabel.textContent = budgetObj.percent + '%';
            else
                DOMElements.percentageLabel.textContent = '...';
        },
        displayPercentages: percentages => {

            var nodeListForEach = ( items, callback) => {
                for ( var i = 0 ; i < fields.length ; i++)
                    callback(items[i], i);
            }

            var fields = document.querySelectorAll('.cc-percent-expense');

            nodeListForEach( fields, (item, index) => {
                
                if ( percentages[index] > 0 )
                    item.textContent = percentages[index] + '%';
                else
                    item.textContent = '---';
            })
        },
        removeItem: itemID => {
            document.querySelector('#'+itemID).remove();
        },
        changeColor: (event) => {
            var activeTypeElement, clickedTypeElement, activeType;

            activeTypeElement = getActiveSelector();
            clickedTypeElement = event.target.parentNode;
            
            activeType = activeTypeElement.classList.contains('income-selector') ? 'inc' : 'exp';

            if (clickedTypeElement !== activeTypeElement) {
                activeTypeElement.classList.remove('active-selector');
                clickedTypeElement.classList.add('active-selector');

                DOMElements.inputDesc.classList.toggle('red');
                DOMElements.inputAmt.classList.toggle('red');
                DOMElements.addBtn.classList.toggle('red');
            }

        }
    }
})();

// App Main Controller

var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = () => {

        var DOM = UICtrl.getDOMElements;

        DOM.typeContainer.addEventListener('click', (event) => {
            UICtrl.changeColor(event);
        });

        DOM.addBtn.addEventListener('click', controllerAddItem);
        document.addEventListener('keypress', function(event){
        if ( event.keyCode === 13 || event.which === 13)
            controllerAddItem();
        
        DOM.container.addEventListener('click', controllerRemoveItem);
        
    });
    }

    var updateBudget = function() {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Update the UI
        UICtrl.displayBudget(budget);
    }

    var updatePercentages = () => {

        // 1. Calculate the percentage
        budgetCtrl.calculatePercentages();

        // 2. Retrive the percentages
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the UI to display the updated percentages
        UICtrl.displayPercentages(percentages);
    }

    var controllerAddItem = function() {
        
        var uiInput, newItem;
        // 1. Get the field input values
        uiInput = UICtrl.getInput();

        if( uiInput.desc !== '' && !isNaN(uiInput.amount) && uiInput.amount > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(uiInput.type, uiInput.desc, uiInput.amount);

            // 3. Add the item to the UI
            UICtrl.insertNewItem(newItem, uiInput.type);

            // 4. Clear the fields
            UICtrl.clearFields();
        }
        
        // 5. Calculate and update the budget
        updateBudget();

        // 6. Calculate and update the percetages
        updatePercentages();
        
    }

    var controllerRemoveItem = event => {
        var itemID, splitID, type, ID; 

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Remove item from the budget controller
            budgetCtrl.removeItem(type, ID);

            // 2. Remove item from the UI
            UICtrl.removeItem(itemID);

            // 3. Update and show the budget
            updateBudget();

            // 4. Calculate and update the percetages
            updatePercentages();
        }

        

    }
    return {
        init: () => {
            console.log('Application has started!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                income: 0,
                expense: 0,
                percent: -1
            });
            setupEventListeners();
        }
    }
})(budgetController, UIController);

// Entry Point of Application
controller.init();