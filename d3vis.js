/*
* vis.js - yet another D3JS visualization library, designed specifically for the Measure 2 Manage project.
* MIT LICENSE
* Written by Nicholas Potter (potter.nicholas@gmail.com)
* Source: http://www.github.com/potterzot/vis
* requires d3.js - http://www.d3js.org
*/

(function() {

	var vis = window.vis || {};
	vis.version = "0.0.1";
	vis.dev = true; // development version. Set to false if in production
	
	window.vis = vis;

	vis.bar = function(container, settings) {
		// bar graph - 
		// container (required) is an svg element (e.g. g or svg) 
		// settings (optional) is an object containing all the settings
		var bar = {};

		// check that the container exists
		var container = d3.select(container);
		if(container[0]===null) { return "Container doesn't exist"; }

		var defaultSettings = {
			tooltips: false
			, vertical: true
			, margin: {top: 100, left: 100, right: 100, bottom: 100}
			, width: 900
			, height: 500
			, barGap: .1
			, barStyle: false
			, xVar: 'x'
			, yVars: ['y']
			, axisMax: 0
			, axisMin: 0
			, xAxisPadding: 5 
			, xAxisOrient: 'bottom'
			, xAxisTitle: false
			, xAxisTitleAnchor: 'middle'
			, xAxisStyle: "font-weight: bold; font-size: 14;"
			, xAxisTitleStyle: "font-weight: bold; font-size: 14;"
			, yAxisPadding: 3
			, yAxisOrient: 'left'
			, yAxisFormat: '1.3f'
			, yAxisTitleAnchor: 'middle'
			, yAxisTitlePadding: 70
			, yAxisTitleStyle: "font-weight: bold; font-size: 14;"
			, yAxisTickNumber: 5
			, titlePadding: 30
			, titleAlign: 'middle'
			, subTitlePadding: 20
			, colors: ["#D7EB3C", "#0D6854", "#E9F681", "#C3CDC3", "#B9F7BC"]
			, legend: {
				stacked: true
				, boxSize: 18
				, textX: -30
				, textAnchor: 'end'
				, entryTransformX: 0
			}
		};


		// set bar settings to the user supplied, replacing any missing with the defaults
		bar.settings = settings || defaultSettings;
	 	Object.keys(defaultSettings).forEach(function(key) {
	 		if (bar.settings[key]===undefined) bar.settings[key] = defaultSettings[key];
	 	})

	 	// set some settings that depend on others
	 	bar.settings.plotWidth = bar.settings.plotWidth || bar.settings.width - bar.settings.margin.left - bar.settings.margin.right;
	 	bar.settings.plotHeight = bar.settings.plotHeight || bar.settings.height - bar.settings.margin.top - bar.settings.margin.bottom;
	 	bar.settings.xAxisX = bar.settings.xAxisX || bar.settings.width/2;
	 	bar.settings.xAxisY = bar.settings.xAxisY || bar.settings.height - bar.settings.margin.bottom;
	 	bar.settings.yAxisX = bar.settings.yAxisX || -bar.settings.plotHeight/2;
	 	bar.settings.yAxisY = bar.settings.yAxisY || -bar.settings.yAxisTitlePadding;
	 	bar.settings.titleX = bar.settings.titleX || bar.settings.width/2;
	 	bar.settings.subtitleX = bar.settings.subtitleX || bar.settings.width/2;

	 	var s = bar.settings
	 	if(s.legend) {
			s.legend.textY = s.legend.textY || s.legend.boxSize/2;
			s.legend.entryTransformY = s.legend.entryTransformY || s.legend.boxSize + 2;
			s.legend.entryTransform = s.legend.entryTransform || function(d, i) { 
				return "translate("+s.legend.entryTransformX+"," + i * s.legend.entryTransformY + ")"; 
			};
	 		s.legend.transform = s.legend.transform || function() { 
				var transformX = s.legend.transformX || s.width-s.margin.right;
				var transformY = s.legend.transformY || s.margin.top;
	 			return "translate("+(s.width-s.margin.right)+"," + (s.margin.top) + ")"; 
	 		};
	 	}

		bar.build = function() {
			var self = this;
			// create the outer parts of the figure
			// title, axes, etc...
			var s = self.settings;

			// container for all added elements
			self.g = container.append('g')
				.attr('class', 'vis');

			// create scales
			self.xScale0 = d3.scale.ordinal() // scale between x groups
				.rangeRoundBands([s.margin.left,s.plotWidth+s.margin.left], s.barGap);

			self.xScale1 = d3.scale.ordinal(); // scale within a given x category
			
			self.yScale = d3.scale.linear()
				.range([s.plotHeight,s.yAxisPadding]);

			self.colorScale = d3.scale.ordinal()
				.range(s.colors);

			// create axes
			self.xAxis = d3.svg.axis()
				.scale(self.xScale0)
				.orient(s.xAxisOrient);
			self.yAxis = d3.svg.axis()
				.scale(self.yScale)
				.orient(s.yAxisOrient)
				.ticks(s.yAxisTickNumber);

			// if a format is indicated, then set it, otherwise don't
			if(s.xAxisFormat) self.xAxis.tickFormat(d3.format(s.xAxisFormat));
			if(s.yAxisFormat) self.yAxis.tickFormat(d3.format(s.yAxisFormat));

			// create the main title
			if(s.title) {	
				var title = self.g.append('g')
					.attr('class', 'vis-title')
					.append('text')
						.attr('x', s.titleX)
						.attr('y', s.titlePadding)
						.attr('text-anchor', s.titleAlign);

				// create the style if needed
				if(s.titleStyle) title.attr('style', s.titleStyle);
				title.text(s.title);
			}

			// create the subtitle
			if(s.subtitle) {
				var subtitle = self.g.append('g')
					.attr('class', 'vis-subtitle')
					.append('text')
						.attr('x', s.subtitleX)
						.attr('y', s.titlePadding + s.subTitlePadding)
						.attr('text-anchor', s.titleAlign);

				if(s.subTitleStyle) subtitle.attr('style', s.subTitleStyle);
				subtitle.text(s.subtitle);
			}

			// draw the axes
		    // draw the x axis
			var xaxis = self.g.append("g")
		    	.attr("class", "x axis")
		      	.attr("transform", "translate(" + 0 + "," + (s.plotHeight + s.margin.top) + ")")
		      	.call(self.xAxis);

		    var xaxisTitle = xaxis.append('text')
		      		.attr('class', 'x axis text')
		      		.attr('y', s.xAxisY)
		      		.attr('x', s.xAxisX)
		      		.attr('dy', '.71em')
		      		.attr('text-anchor', s.xAxisTitleAnchor)
		      		.text(s.xAxisTitle);

			if(s.xAxisStyle) xaxis.attr('style', s.xAxisStyle);
			if(s.xAxisTitleStyle) xaxisTitle.attr('style', s.xAxisTitleStyle);

		    // draw the y axis
			var yaxis = self.g.append("g")
		    	.attr("class", "y axis")
		    	.attr("transform", "translate("+ s.margin.left + "," + s.margin.top + ")")
		      	.call(self.yAxis);

		    var yaxisTitle = yaxis.append("text")
			    	.attr('class', 'y axis text')
		    		.attr("transform", "rotate(-90)")
		      		.attr("y", s.yAxisY)
		      		.attr("x", s.yAxisX)
		      		.attr("dy", ".71em")
		      		.attr('text-anchor', s.yAxisTitleAnchor)
		      		.text(s.yAxisTitle);

			if(s.yAxisStyle) yaxis.attr('style', s.yAxisStyle);
			if(s.yAxisTitleStyle) yaxisTitle.attr('style', s.yAxisTitleStyle);

			// build the tips if set
			if(s.tooltips) {
				self.tip = d3.tip()
  					.attr('class', 'd3-tip')
  					.offset(s.tooltips.offset)
  					.html(function(d) {
    					return s.tooltips.html;
  					});

  				// associate the tooltips with the container
  				self.g.call(self.tip);
			}

			// create a legend if set
			if(s.legend) {
				var legend = self.g.append('g')
					.attr('class', 'legend')
					.attr('transform', s.legend.transform);

				if(s.legend.style) legend.attr('style', s.legend.style);

				var legendEntry = legend.selectAll(".legend-entry")
      				.data(s.yVars.slice())
    				.enter().append("g")
      				.attr("class", "legend-entry")
      				.attr("transform", s.legend.entryTransform);

				var legendBox = legendEntry.append("rect")
					.attr('class', 'legend-box')
			    	.attr("x", -s.legend.boxSize)
			    	.attr("width", s.legend.boxSize)
			    	.attr('y', 0)
			    	.attr("height", s.legend.boxSize)
			    	.style("fill", self.colorScale);

			    (s.legend.boxStyle) 
			    	? legendBox.attr('style', function(d) { return s.legend.boxStyle+'fill:'+self.colorScale(d); })
			    	: legendBox.attr('style', function(d) { return 'fill:'+self.colorScale(d); });

			  	var legendText = legendEntry.append("text")
			    	.attr('class', 'legend-text')
			    	.attr("x", s.legend.textX)
			    	.attr("y", s.legend.textY)
			    	.attr("dy", ".35em")
			    	.attr('text-anchor', s.legend.textAnchor)
			    	.text(function(d) { return d; });
			}

		}

		bar.draw = function(data) {
			var self = this;
			// set shortcut for settings
			var s = self.settings;

			// reorder the data for graphing
			data.forEach(function(d) {
				d.y = s.yVars.map(function(yVar) { return {name: yVar, value: +d[yVar]}; })
			})
			self.data = data;

			// adjust the scale and redraw the axis
			// maximum and minimum
			var max = s.yAxisMax || d3.max([d3.max(data.map(function(d) { return d[s.yVars[0]]; })), s.axisMax]);
			var min = s.yAxisMin || d3.min([d3.min(data.map(function(d) { return d[s.yVars[0]]; })), s.axisMin]);

			// x axis
			self.xScale0.domain(data.map(function(d) { return d[s.xVar]; }));
			self.xAxis.scale(self.xScale0);
 			self.g.select('.x.axis')
 				.transition()
 				.duration(500)
 				.call(self.xAxis);
		
			// within each x category
			self.xScale1.domain(s.yVars).rangeRoundBands([0, self.xScale0.rangeBand()]);

			// y axis
			self.yScale.domain([0,max]);
			self.yAxis.scale(self.yScale);
    		self.g.select('.y.axis')
    			.transition()
    			.duration(500)
    			.call(self.yAxis);

	    	// select the bar groups (each category)
		  	var barGroups = self.g.selectAll(".bargroup")
		  		.data(data)
		  		.enter().append('g')
		  			.attr('class', function(d) { return 'g bargroup ' + d[s.xVar]; })
		  			.attr('transform', function(d) { return "translate("+(self.xScale0(d[s.xVar]))+",0)"; });

		  	// select the bars within each group
		  	var bars = barGroups.selectAll('rect')
		  		.data(function(d) { return d.y; });

		  	var barsEnter = bars.enter().append('rect')
	  			.attr('class', function(d) { return 'bar '+d.name; })
	  			.attr('x', function(d) { return self.xScale1(d.name); })
	  			.attr('width', self.xScale1.rangeBand())
	  			.attr('y', function(d) { return self.yScale(d.value); })
	  			.attr('height', function(d) { return s.plotHeight - s.xAxisPadding - self.yScale(d.value); })
	      		.on('mouseover', function(d) { return (s.tooltips) ? self.tip.show : null; })
	      		.on('mouseout', function(d) { return (s.tooltips) ? self.tip.hide : null; });

	      	var barsUpdate = bars.transition()
	      		.duration(s.duration)
		      	.attr("y", function(d) { return self.yScale(d.value) + s.margin.top; })
		      	.attr("height", function(d) { return s.plotHeight - s.xAxisPadding - self.yScale(d.value); });

	      	var barsExit = bars.exit().transition()
	      		.duration(s.duration)
	      		.remove();

	      	(s.barStyle) 
	      		? barsEnter.attr('style', function(d) { return s.barStyle+"fill:"+self.colorScale(d.name)+";"; })
	      		: barsEnter.attr('style', function(d) { return "fill:"+self.colorScale(d.name)+";"; });
		}

		bar.container = container;
		bar.build();
		return bar;
	}
})();




