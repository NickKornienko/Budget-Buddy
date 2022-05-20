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
        
    };

    app.enumerate = (a) => {
        // This adds an _idx field to each element of the array.
        let k = 0;
        a.map((e) => {e._idx = k++;});
        return a;
    };
    

    
    app.set_chart = function () {
        let data = google.visualization.arrayToDataTable([
          ['Task', 'Hours per Day'],
          ['Work',     11],
          ['Eat',      2],
          ['Commute',  2],
          ['Watch TV', 2],
          ['Sleep',    7]
        ]);
        let options = {'title':'How Much Pizza I Ate Last Night',
                       'width':400,
                       'height':300};
        
        app.chart = new google.visualization.PieChart(document.getElementById('pie_chart'));
        
        app.chart.draw(data, options);
       
    }

    app.draw = function () {
        let data = google.visualization.arrayToDataTable([
          ['Task', 'Hours per Day'],
          ['Work',     11],
          ['Eat',      2],
          ['Commute',  2],
          ['Watch TV', 2],
          ['Sleep',    7]
        ]);
        let options = {'title':'How Much Pizza I Ate Last Night',
                       'width':400,
                       'height':300};
        //app.chart.draw(data, options);
    }

    
    // This contains all the methods.
    app.methods = {
        // Complete as you see fit.
        set_chart: app.set_chart,
        
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
        axios.get(graph).then(function (response) {
            app.vue.chart = app.enumerate(response.data.chart);
        });
       app.set_chart();
    };

    // Call to the initializer.
    app.init();
};

// This takes the (empty) app object, and initializes it,
// putting all the code i
function start_app() {
    init(app);
}


// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(start_app);

