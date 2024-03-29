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
        query: "",
        results: [],
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

    
    app.drawChart = function() {

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
        options = {'title':'How Much Pizza I Ate Last Night',
                       'width':400,
                       'height':300};

        // Instantiate and draw our chart, passing in some options.
        chart = new google.visualization.PieChart(document.getElementById('pie_chart'));
        google.visualization.events.addListener(chart, 'select', app.selectHandler);
        chart.draw(data, options);
      }

    app.search = function () {
        if (app.vue.query.length > 1) {
            axios.get(search_url, { params: { q: app.vue.query} })
                .then(function (result) {
                    app.vue.results = result.data.results;
                });
        }
        else {
            app.vue.results = [];
        }
    };
    

    app.go_to_budget = function () {
        for (let i = 0; i < app.vue.results.length; i++) {
            let b = app.vue.results[i];
            axios.get(get_budget_url, {params: {budget_id: app.vue.results[i] } })
                .then(function (r) {
                    console.log("here");
                    window.location = r.data.url;
                });
        }
    };

    
    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        drawChart: app.drawChart,
        selectHandler: app.selectHandler,
        search: app.search,
        go_to_budget: app.go_to_budget,
    };

    // This creates the Vue instance.
    app.vue = new Vue({
        el: "#vue-target",
        data: app.data,
        methods: app.methods
    });

    // And this initializes it.
    app.init = () => {
        // Put here any initialization code.
        // Typically this is a server GET call to load the data.
        //axios.get(chart).then(function (response) {
        //    app.vue.chart = app.enumerate(response.data.chart);
        //});
       app.drawChart();
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
function start_app() {
    init(app);
}
init(app);

// Load the Visualization API and the piechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
    google.charts.setOnLoadCallback(start_app);
