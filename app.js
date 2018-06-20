//Budget Controller

var budgetController = (function(){
    
    var Expense = function(id,desc,value){
        this.id =id;
        this.desc = desc;
        this.value = value;
        this.percentage = -1;
    };
    
    var Income = function(id,desc,value){
        this.id =id;
        this.desc = desc;
        this.value = value;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome>0){
        this.percentage =  Math.round((this.value/totalIncome)*100);
        }else{
        this.percentage = -1; 
        }

    };
    Expense.prototype.getPrecentage = function(){
        return  this.percentage;
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(current){
            sum += current.value;
            
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems:{
            exp : [],
            inc : []
        },
        totals : {
            exp: 0,
            inc : 0
        },
        budget: 0,
        percentage : -1
    };
    
    return{
        
        addItem : function(type, des, val){
            var newItem, ID;
            
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
            }
            else{
                ID =0;
            }
            if(type === 'exp'){
                newItem =  new Expense(ID,des,val)
            }
            else if(type === 'inc'){
                newItem =  new Income(ID,des,val)
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem : function(type,id){
            var id, index;
            
            ids =  data.allItems[type].map(function(current){
                
                return current.id;
            });
            index = ids.indexOf(id);
            
            if(index !==-1){
                data.allItems[type].splice(index, 1);
            }
            
        },
        calculateBudget : function(){
            //calculate total income/expenses
            
            calculateTotal('exp');
            calculateTotal('inc');
            
            //calculate the budget: income-expense
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                //calculate the percentage of income we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc)*100);
            }
            else{
                data.percentage = -1;
            }
        },

        calculatePercentages: function(){

            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPrecentages :function(){
            var allPercentage = data.allItems.exp.map(function(cur){

                return cur.getPrecentage();
            });

            return allPercentage;

        },


        getBudget : function(){
            return{
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpense: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function(){
            console.log(data);
        }
    }; 
})();


// UI controller
var UIController = (function(){
    
    var DOMstrings = {
        
        inputType : '.add__type',
        inputDesc : '.add__description',
        inputValue : '.add__value',
        inputButton : '.add__btn',
        incomeContainer : '.income__list',
        expenseContainer : '.expenses__list',
        bugetLabel : '.budget__value',
        incomeLabel :'.budget__income--value',
        expenseLabel : '.budget__expenses--value',
        pecentageLabel : '.budget__expenses--percentage',
        container: '.container',
        expensesPercentageLabel: '.item__percentage',
        dateLabel : '.budget__title--month'
        
    };

    var nodeListForEach = function(list,callback){
        for(var i=0; i<list.length; i++){
            callback(list[i],i)
        }

    };

    var formatNumber = function(num,type){
        var numSplit,num,int,dec;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];

        if(int.length>3){
            int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }

         

        return (type==='exp' ? '-' : '+') + " "  +int +'.'+dec;
        

    };
    
    return{
        getInput: function(){
            
            return{
                
                type : document.querySelector(DOMstrings.inputType).value,
                desc : document.querySelector(DOMstrings.inputDesc).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value)
                
            };
        },
        
        addListItem : function(obj, type){
            // HTML string with place holder text
            var html, newHtml,element;
            
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%des%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            // Replace placeholder text with actual data
            newHtml = html.replace('%id%',obj.id);
            newHtml = newHtml.replace('%des%',obj.desc);
            newHtml = newHtml.replace('%value%',formatNumber(obj.value,type));
            
            // insert the HTML into the DOM
            
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
        },
        deleteListItem : function(selectorID){
            
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        clearFields : function(){
            var fields;
            fields = document.querySelectorAll(DOMstrings.inputDesc+','+DOMstrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
            
        },
        displayBudget : function(obj){
            var type;
            obj.budget> 0 ? type = 'inc': type ='exp';

            document.querySelector(DOMstrings.bugetLabel).textContent = formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalIncome,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExpense,'exp');
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.pecentageLabel).textContent = obj.percentage + '%';
                
            }
            else{
                document.querySelector(DOMstrings.pecentageLabel).textContent = '---';
                
            }
        },

        displayPercentages: function(percentages){
            var fields =document.querySelectorAll(DOMstrings.expensesPercentageLabel);

            
            nodeListForEach(fields,function(current,index){
                if (percentages[index]>0){
                current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '___';

                }
            });
        },
        displayMonth: function(){

            var now, year, month,months; 
                now = new Date();
                year = now.getFullYear();
                months = ['january', 'feb', 'mar', 'apr', 'june', 'july', 'aug', 'sep','oct','nov','dec'];
                month = now.getMonth();
                document.querySelector(DOMstrings.dateLabel).textContent = months[month]+" "+year; 

        },
        changedType : function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType+','+
                DOMstrings.inputDesc+','+
                DOMstrings.inputValue);
                
            nodeListForEach(fields,function(cur){

                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
       
        getDOMstrings : function (){
            return DOMstrings;
        }
    }
    
    
})();



//APP controller

var controller = (function(budgetCtrl,UIctrl){
    
    var setupEventListeners = function(){
        
        var DOM = UIctrl.getDOMstrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);
        
        document.addEventListener('keypress',function(e){
            
            if(e.keyCode===13 || e.which===13){
                
                e.preventDefault();
                
                ctrlAddItem();
                
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changedType)
        
    }
    var updateBudget = function(){
        
        // calculate the budget
        
        budgetCtrl.calculateBudget();
        
        //return budget
        
        var budget = budgetCtrl.getBudget();
        
        //display budget to the UI
        
        UIctrl.displayBudget(budget);
    };
    
    var updatePercentages = function(){

        // calculate the percentages

        budgetCtrl.calculatePercentages();

        //read it from the budgetCtrler

        var percentages = budgetCtrl.getPrecentages();

        //update to UI

        UIctrl.displayPercentages(percentages);

    }
    
    
    var ctrlAddItem = function(){
        var input, newItem;
        //get field input 
        
        input = UIctrl.getInput();
        
        if(input.desc !== "" && !isNaN(input.value) && input.value > 0){
            
            //add the item to the budget controller
            
            newItem = budgetCtrl.addItem(input.type, input.desc,input.value);
            
            //add it to the UI
            
            UIctrl.addListItem(newItem, input.type);
            
            //Clear the fileds
            
            UIctrl.clearFields();
            //calculate and update budget
            
            updateBudget();

            //calc and update percentages

            updatePercentages();
            
        }
        
    };
    
    var ctrlDeleteItem = function(event){
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        var splitID,type,ID;
        if(itemID){
            splitID = itemID.split("-");
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            
            // Delete the item from the datastrucute
            
            budgetCtrl.deleteItem(type, ID);
            
            //Delete from UI
            
            UIctrl.deleteListItem(itemID);
            
            //update and show th new budget
            
            updateBudget();
            
            //calc and update percentages
            updatePercentages();

            
        }
    };
    
    return{
        init: function(){
            console.log('starts');
            UIctrl.displayMonth();
            UIctrl.displayBudget({
                budget: 0,
                totalIncome: 0,
                totalExpense: 0,
                percentage: 0
            });
            setupEventListeners();
            
        }
    };
    
    
    
})(budgetController, UIController);


controller.init();