// This will be the object that will contain the Vue attributes
// and be used to initialize it.
let app = {};


// Given an empty app object, initializes it filling its attributes,
// creates a Vue instance, and then initializes the Vue instance.
let init = (app) => {

    // This is the Vue data.
    app.data = {
        // Complete as you see fit.
        data:[],
        chart:[],
        options:{},
        budgets:[],
        budget_items:[],
        budget_id:0,
        columns_chart_table:[],
        columns_chart:[],
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
        
        
        // Create our data table.
        data = new google.visualization.DataTable();
        data.addColumn('string', 'Topping');
        data.addColumn('number', 'Slices');
        data.addRows([
          ['Mushrooms', 3],
          ['Onions', 1],
          ['Olives', 1],
          ['Zucchini', 1],
          ['Pepperoni', 2]
        ]);

        // Set chart options
        options = {
                       'width':400,
                       'height':300};

        // Instantiate and draw our chart, passing in some options.
        chart = new google.visualization.PieChart(document.getElementById('pie_chart'));
        google.visualization.events.addListener(chart, 'select', app.selectHandler);
        chart.draw(data, options);
      };
    
    app.columnChart = function() {
        
        columns_chart_table = google.visualization.arrayToDataTable([
            ['Year', 'Sales', 'Expenses'],
            ['2012',  900,      390],
            ['2013',  -1000,      400],
            ['2014',  -1170,      440],
            ['2015',  1250,       480],
            ['2016',  1530,      540]
        ]);
    
        //app.vue.display_mode = "column_chart";
        //columns_chart_table = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('number', 'Amount');
        
        
        let options = {
            title: 'House',
            isStacked:true	  
        };  

        // Instantiate and draw the chart.
        let Cchart = new google.visualization.ColumnChart(document.getElementById('column_chart'));
        google.visualization.events.addListener(Cchart, 'select', app.selectHandler);
        Cchart.draw(columns_chart_table, options);
         
    }

    app.display_graph=function(display_type){
        app.vue.display_mode = display_type;
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
        display_graph: app.display_graph,
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
            console.log(response)
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
        console.log(app.vue.budget_id);
        //app.pieChart();
        //app.column_chart();
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
    