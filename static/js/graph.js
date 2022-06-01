// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        In_pie_data:[],
        Ex_pie_data:[],
        budgets:[],
        budget_items:[],
        budget_id:0,
        columns_data:[],
        display_mode: 'none' // options right now should be 'pie_chart' or 'coloumn_chart'
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
    
    app.selectHandler = function() {
        var selectedItem = chart.getSelection()[0];
        var value = data.getValue(selectedItem.row, 0);
        alert('The user selected ' + value);
      }

    
    app.pieChart = function() {
        
        //creating data table for columns chart
        let Indata = new google.visualization.DataTable();
        let Exdata = new google.visualization.DataTable();
        Indata.addColumn('string', 'Name');
        Indata.addColumn('number', 'Amount');
        Exdata.addColumn('string', 'Name');
        Exdata.addColumn('number', 'Amount');
        for (let i=0;i<app.vue.budget_items.length;i++){
            let row = app.vue.budget_items[i];
            if (row.type == "Expense") {
                Exdata.addRow([row.name, row.amount]);
            } else if (row.type == "Income"){
                Indata.addRow([row.name, row.amount]);
            }
        }

        app.vue.In_pie_data = Indata;
        app.vue.Ex_pie_data = Exdata;
        // Set chart options
        let Inoptions = {
                        'title': 'Income',
                       'width':400,
                       'height':300};

        let Exoptions = {
                        'title':'Expense',
                        'width':400,
                        'height':300};

        // Instantiate and draw our chart, passing in some options.
        let Inchart = new google.visualization.PieChart(document.getElementById('Income_pie_chart'));
        google.visualization.events.addListener(Inchart, 'select', app.selectHandler);
        Inchart.draw(app.vue.In_pie_data, Inoptions);

        let Exchart = new google.visualization.PieChart(document.getElementById('Expense_pie_chart'));
        google.visualization.events.addListener(Exchart, 'select', app.selectHandler);
        Exchart.draw(app.vue.Ex_pie_data, Exoptions);
      };
    
    app.columnChart = function() {
        
        //creating data table for columns chart
        let Cdata = new google.visualization.DataTable();
        Cdata.addColumn('string', 'Name');
        Cdata.addColumn('number', 'Amount');
        Cdata.addColumn({role: "style"});
        for (let i=0;i<app.vue.budget_items.length;i++){
            let row = app.vue.budget_items[i];
            if (row.type == "Expense") {
                Cdata.addRow([row.name, 0-row.amount,'red']);
            } else if (row.type == "Income"){
                Cdata.addRow([row.name,row.amount,'green']);
            }
        }

        app.vue.columns_data = Cdata;
        
        let options = {
            title: 'House',
            isStacked:false	  
        };  

        // Instantiate and draw the chart.
        let chart = new google.visualization.ColumnChart(document.getElementById('column_chart'));
        google.visualization.events.addListener(chart, 'select', app.selectHandler);
         chart.draw(app.vue.columns_data, options);
         
    }


    app.display_items = function(display_type){
        app.vue.display_mode = display_type;
        
        if (display_type == 'pie_chart') {
            app.pieChart();
        } else if (display_type == 'column_chart'){
            app.columnChart()
        }
    }

    
    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        pieChart: app.pieChart,
        columnChart: app.columnChart,
        selectHandler: app.selectHandler,
        display_items: app.display_items,
        //tableGraph: app.tableGraph,
        
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {

        axios.get(get_budgets_url).then(function (response) {
            app.vue.budgets = app.enumerate(response.data.budgets);
        });
        app.vue.budget_id = budget_id
        console.log("before axios");

        axios.post(get_budget_items_url,{budget_id: app.vue.budget_id}).
            then(function(response){
                console.log("in axios call");
            items = response.data.budget_items;
            app.enumerate(items);
            app.vue.budget_items = items;
           
            
        });

       //app.tableGraph();
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
function start_app() {
    init(app);
}
//init(app);

// Load the Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(start_app);
    