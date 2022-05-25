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

    app.tableGraph = function() {
        google.charts.load('current', {'packages':['table']});
        google.charts.setOnLoadCallback(drawTable);
        
        function drawTable() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'Name');
        data.addColumn('number', 'Salary');
        data.addColumn('boolean', 'Full Time Employee');
        data.addRows([
        ['Mike',  {v: 10000, f: '$10,000'}, true],
        ['Jim',   {v:8000,   f: '$8,000'},  false],
        ['Alice', {v: 12500, f: '$12,500'}, true],
        ['Bob',   {v: 7000,  f: '$7,000'},  true]
        ]);

        //var table = new google.visualization.Table(document.getElementById('table_div'));

        //table.draw(data, {showRowNumber: true, width: '100%', height: '100%'});
    }
    }
    
    
    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        pieChart: app.pieChart,
        selectHandler: app.selectHandler,
        tableGraph: app.tableGraph,
        
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
        
       app.pieChart();
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
    