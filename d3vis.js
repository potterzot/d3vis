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

	vis.yScale = function(graph, d) {
		var self = graph;
		var s = self.settings;
		if (s.yAxis1.enabled) {
			if (s.xOnY1.indexOf(d.xgroup)!==-1 || (s.xOnY1===false && s.yVars1.indexOf(d.name)!==-1)) {
				var scale = self[s.yAxis1.scale];
			}
			else {
				var scale = self[s.yAxis0.scale];
			}
		}
		else {
			var scale = self[s.yAxis0.scale];
		}
		return scale(d.value);
	}

	vis.bar = function(container, settings) {
		// bar graph - 
		// container (required) is an svg element (e.g. g or svg) 
		// settings (optional) is an object containing all the settings
		var bar = {};

		// check that the container exists
		var container = d3.select(container);
		if(container[0]===null) { return "Container doesn't exist"; }

		var defaultSettings = {
			tooltips: {
				offset: [-10,0]
				, html: function(d) { return "<strong>"+d.name+":</strong> <span style='color:"+"#FFF"+"'>" + d.value + "</span>"; }
			}
			, palette5a: ["#D7EB3C", "#0D6854", "#E9F681", "#C3CDC3", "#B9F7BC"]
			, vertical: true
			, margin: {top: 100, left: 100, right: 100, bottom: 100}
			, width: 900
			, height: 500
			, barGap: .1
			, barStyle: false
			, xVar: 'x'
			, yVars0: ['y']
			, yVars1: false // by default no second y axis
			, xOnY0: false // by default all x categories are on y axis 0
			, xOnY1: false // by default no x categories are on y axis 1.
			, axisMax: 0
			, axisMin: 0
			, valueLabels: {
				vars: []
				, format: '0.2f'
				, anchor: 'middle'
				, size: 12
				, weight: 'bold'
				, fill: '#000'
				, padding: 5
			}
			, xAxis: {
				enabled: true
				, padding: 5 
				, orient: 'bottom'
				, scale: 'xScale0'
				, labelSize: 14
				, labelWeight: 'bold'
				, title: false
				, titleAnchor: 'middle'
				, titleSize: 14
				, titleWeight: 'bold' 
			}
			, yAxis0: {
				enabled: true
				, min: 0
				, padding: 3
				, orient: 'left'
				, tickFormat: '1.3f'
				, ticks: 5
				, scale: 'yScale0'
				, labelSize: 14
				, labelWeight: 'bold'
				, title: false
				, titleAnchor: 'middle'
				, titlePadding: 70
				, titleSize: 14
				, titleWeight: 'bold'
				, titleRotate: -90 
			}
			, yAxis1: {
				enabled: false
				, min: 0
				, padding: 3
				, orient: 'right'
				, tickFormat: '1.3f'
				, ticks: 5
				, scale: 'yScale1'
				, labelSize: 14
				, labelWeight: 'bold'
				, title: false
				, titleAnchor: 'middle'
				, titlePadding: -70
				, titleSize: 14
				, titleWeight: 'bold' 
				, titleRotate: -90 
			}
			, title: {
				text: false
				, padding: 30
				, align: 'middle'
				, size: 18
				, weight: 'bold'
				, fill: '#000'
			}
			, subTitle: {
				text: false
				, padding: 20
				, align: 'middle'
				, size: 14
				, weight: 'normal'
				, fill: '#000'
			}
			, legend: {
				enabled: true
				, stacked: true
				, boxSize: 18
				, textX: -30
				, textAnchor: 'end'
				, entryWidth: 150
			}
		};


		// set bar settings to the user supplied, replacing any missing with the defaults
		var s = settings || defaultSettings;
	 	Object.keys(defaultSettings).forEach(function(key) {
	 		if (s[key]===undefined) s[key] = defaultSettings[key];
	 	});

	 	// for settings with subsettings, loop through each subsetting
	 	['legend', 'margin', 'xAxis', 'yAxis0', 'yAxis1', 'title', 'subTitle', 'tooltips', 'valueLabels'].forEach(function(setting) {
	 		if (s[setting]) {
		 		Object.keys(defaultSettings[setting]).forEach(function(key) {
	 				if (s[setting][key]===undefined) s[setting][key] = defaultSettings[setting][key];
		 		});
	 		}
	 	});

	 	// set some settings that depend on others
	 	s.plotWidth = s.plotWidth || s.width - s.margin.left - s.margin.right;
	 	s.plotHeight = s.plotHeight || s.height - s.margin.top - s.margin.bottom;
	 	s.xAxis.X = s.xAxis.X || s.width/2;
	 	s.xAxis.Y = s.xAxis.Y || s.height - s.margin.bottom;
	 	s.yAxis0.X = s.yAxis0.X || -s.plotHeight/2;
	 	s.yAxis0.Y = s.yAxis0.Y || -s.yAxis0.titlePadding;
	 	s.yAxis1.X = s.yAxis1.X || -s.plotHeight/2;
	 	s.yAxis1.Y = s.yAxis1.Y || -s.yAxis1.titlePadding;
	 	s.title.X = s.title.X || s.margin.left + s.plotWidth/2;
	 	s.subTitle.X = s.subTitle.X || s.width/2;

	 	// colors to use
	 	(!s.colors) 
	 		? s.colors = s.palette5a // default color used
	 		: (typeof(s.colors)==="string") 
	 			? s.colors = s[s.colors] // user specified a preset color palette
	 			: s.colors = s.colors; // user specified an array of color values to be used

	 	// legend settings
	 	if(s.legend.enabled) {
	 		if(s.legend.stacked) {
				s.legend.textY = s.legend.textY || s.legend.boxSize/2;
				s.legend.entryTransformX = s.legend.entryTransformX || 0;
				s.legend.entryTransformY = s.legend.entryTransformY || s.legend.boxSize + 2;
				s.legend.entryTransform = s.legend.entryTransform || function(d, i) { 
					return "translate("+s.legend.entryTransformX+"," + i * s.legend.entryTransformY + ")"; 
				};
		 		s.legend.transform = s.legend.transform || function() { 
					var transformX = s.legend.transformX || s.width-s.margin.right;
					var transformY = s.legend.transformY || s.margin.top;
		 			return "translate("+ transformX +"," + transformY + ")"; 
		 		};
		 	}
		 	else {
				s.legend.textY = s.legend.textY || s.legend.boxSize/2;
				s.legend.entryTransformX = s.legend.entryTransformX || s.legend.entryWidth;
				s.legend.entryTransformY = s.legend.entryTransformY || 0;
				s.legend.entryTransform = s.legend.entryTransform || function(d, i) { 
					return "translate("+(i*s.legend.entryTransformX)+"," + s.legend.entryTransformY + ")"; 
				};
		 		s.legend.transform = s.legend.transform || function() { 
					var transformX = s.legend.transformX || s.margin.left;
					var transformY = s.legend.transformY || s.height - s.margin.bottom + 30;
		 			return "translate("+ transformX +"," + transformY + ")"; 
		 		};

		 	}

	 	}

	 	// title style if not set to false
	 	["title", "subTitle", "valueLabels"].forEach(function(t) {
	 		if (s[t].style!==false) {
	 			s[t].style = s[t].style 
	 				|| "font-size:"+s[t].size
	 					+"; font-weight:"+s[t].weight
	 					+"; fill:"+s[t].fill
	 					+";";
	 		}
	 	});

	 	// axis settings
	 	s.xAxis.transform = s.xAxis.transform || "translate(" + 0 + "," + (s.plotHeight + s.margin.top) + ")";
	 	["yAxis0", "yAxis1"].forEach(function(axis) {
	 		if(!s[axis].transform) {
	 			s[axis].transform = (s[axis].orient==="left") 
	 				? "translate("+ s.margin.left + "," + s.margin.top + ")"
	 				: "translate("+ (s.margin.left + s.plotWidth) + "," + s.margin.top + ")";
	 		}
	 	});

	 	// set styles for the axes
	 	["xAxis", "yAxis0", "yAxis1"].forEach(function(axis) {
	 		// set styles
	 		if (s[axis].labelStyle!==false) {
	 			s[axis].labelStyle = s[axis].labelStyle	|| "font-size:"+s[axis].labelSize+";";
	 			if (s[axis].labelFill) s[axis].labelStyle += " fill:"+s[axis].labelFill+";"; 
	 			if (s[axis].labelStroke) s[axis].labelStyle += " stroke:"+s[axis].labelStroke+";"; 
	 			if (s[axis].labelWeight) s[axis].labelStyle += " font-weight:"+s[axis].labelWeight+";"; 
	 		}
	 		if (s[axis].titleStyle!==false) {
	 			s[axis].titleStyle = s[axis].titleStyle || "font-size:"+s[axis].titleSize+";";
	 			if (s[axis].titleFill) s[axis].titleStyle += "fill:"+s[axis].titleFill+";";
	 			if (s[axis].titleStroke) s[axis].titleStyle += " stroke:"+s[axis].titleStroke+";";
	 			if (s[axis].titleWeight) s[axis].titleStyle += " font-weight:"+s[axis].titleWeight+";";
	 		} 
	 	});

	 	// just a shortcut...
	 	bar.settings = s;

		bar.build = function() {
			// create the initial figure, including:
			// 		the title and subtitle
			// 		the x-axis and any y-axes
			// 		the tooltips
			// 		the legend
			//
			// but don't draw the bars yet
			//

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
		
			// scale for yAxis 0	
			self.yScale0 = d3.scale.linear()
				.range([s.plotHeight,s.xAxis.padding]);
			
			// create the scale for yAxis 1	
			if(s.yAxis1.enabled) self.yScale1 = d3.scale.linear().range([s.plotHeight,s.xAxis.padding]);

			self.colorScale = d3.scale.ordinal()
				.range(s.colors);

			// create axes
			["xAxis", "yAxis0", "yAxis1"].forEach(function(axis) {
				self[axis] = d3.svg.axis();
				if (s[axis].scale) self[axis].scale(self[s[axis].scale]);
				if (s[axis].orient) self[axis].orient(s[axis].orient);	
				if (s[axis].tickFormat) self[axis].tickFormat(d3.format(s[axis].tickFormat));	
				if (s[axis].ticks)self[axis].ticks(s[axis].ticks);	
				if (s[axis].tickValues)self[axis].tickValues(s[axis].tickValues);	
			});

			// create the main title
			if(s.title.text) {
				s.title.text.forEach(function(title, i) {
					var t = self.g.append('g')
						.attr('class', 'vis-title')
						.append('text')
							.attr('x', s.title.X)
							.attr('y', s.title.padding + (i)*(s.title.size+2))
							.attr('text-anchor', s.title.align);

					// create the style if needed
					if(s.title.style) t.attr('style', s.title.style);
					// the text
					t.text(title);
				})	

			}

			// create the subtitle
			if(s.subTitle.text) {
				var subtitle = self.g.append('g')
					.attr('class', 'vis-subtitle')
					.append('text')
						.attr('x', s.subTitle.X)
						.attr('y', s.title.padding + s.subTitle.padding)
						.attr('text-anchor', s.subTitle.align);

				if(s.subTitleStyle) subtitle.attr('style', s.subTitle.style);
				subtitle.text(s.subtitle.text);
			}

			// draw the axes
		    // draw the x axis
		    ['xAxis', 'yAxis0', 'yAxis1'].forEach(function(axis) {
		    	if(s[axis].enabled===true) {
		    		// axis
		    		var thisAxis = self.g.append('g')
		    			.attr("class", "axis "+axis)
		      			.attr("transform", s[axis].transform)
		      			.call(self[axis]);

					if(s[axis].labelStyle) thisAxis.attr('style', s[axis].labelStyle);

					// axis title
		      		if(s[axis].title) {
		      			var axisTitle = thisAxis.append('text')
			      			.attr('class', 'axis text '+axis)
				      		.attr('y', s[axis].Y)
				      		.attr('x', s[axis].X)
				      		.attr('dy', '.71em')
				      		.attr('text-anchor', s[axis].titleAnchor)
				      		.text(s[axis].title);
						
						if(s[axis].titleRotate) axisTitle.attr('transform', "rotate("+s[axis].titleRotate+")");	
						if(s[axis].titleStyle) axisTitle.attr('style', s[axis].titleStyle);
				      }
		    	}
		    });

			// build the tips if set
			if(s.tooltips!==false) {
				self.tip = d3.tip()
  					.attr('class', 'd3-tip')
  					.offset(s.tooltips.offset)
  					.html(function(d) { return s.tooltips.html(d); });

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
      				.data(s.yVars0.slice())
    				.enter().append("g")
      				.attr("class", "legend-entry")
      				.attr("transform", s.legend.entryTransform);

				var legendBox = legendEntry.append("rect")
					.attr('class', 'legend-box')
			    	.attr("x", function(d, i) { 
			    		return (s.legend.stacked)
			    			? -s.legend.boxSize
			    			: -s.legend.boxSize; 
			    	})
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
				d.y = s.yVars0.map(function(yVar) { return {xgroup: d[s.xVar], name: yVar, value: +d[yVar]}; })
			})
			self.data = data;

			// adjust the scale and redraw the axis
			// maximum and minimum
			var max0 = (s.yAxis0.max!==false)
				? s.yAxis0.max
				: d3.max(data.map(function(d) { return +d[s.yVars0[0]]; }));
			
			var min0 = (s.yAxis0.min!==false) 
				? s.yAxis0.min
				: d3.min(data.map(function(d) { return +d[s.yVars0[0]]; }));
			
			var max1 = (s.yAxis1.max!==false)
				? s.yAxis1.max
				: d3.max(data.map(function(d) { return +d[s.yVars1[0]]; }));
			
			var min1 = (s.yAxis1.min!==false) 
				? s.yAxis1.min
				: d3.min(data.map(function(d) { return +d[s.yVars1[0]]; }));
			
			// x axis
			self[s.xAxis.scale].domain(data.map(function(d) { return d[s.xVar]; }));
			self.xAxis.scale(self[s.xAxis.scale]);
 			self.g.select('.xAxis.axis')
 				.transition()
 				.duration(500)
 				.call(self.xAxis);
		
			// within each x category
			self.xScale1.domain(s.yVars0).rangeRoundBands([0, self.xScale0.rangeBand()]);

			// y axis 0
			self[s.yAxis0.scale].domain([min0,max0]);
			self.yAxis0.scale(self[s.yAxis0.scale]);
    		self.g.select('.yAxis0.axis')
    			.transition()
    			.duration(500)
    			.call(self.yAxis0);

    		// y axis 1
    		if (s.yAxis1.enabled) {
				self[s.yAxis1.scale].domain([min1,max1]);
				self.yAxis1.scale(self[s.yAxis1.scale]);
	    		self.g.select('.yAxis1.axis')
	    			.transition()
	    			.duration(500)
	    			.call(self.yAxis1);

    		}
	    	// select the bar groups (each category)
			s.barWidth = self.xScale1.rangeBand();
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
		      	.attr("y", s.margin.top + s.plotHeight)
	  			.attr('height', 0);

	  		if(s.tooltips) {
	  			barsEnter.on('mouseover', self.tip.show);
	  			barsEnter.on('mouseout', self.tip.hide);
	  		}

	      	var barsUpdate = bars.transition()
	      		.duration(s.duration)
		      	.attr("y", function(d) { return vis.yScale(self, d) + s.margin.top +1; })
	  			.attr('height', function(d) { 
	  				return d3.max([s.plotHeight - vis.yScale(self, d) - s.xAxis.padding, 0]); 
	  			});

	      	var barsExit = bars.exit().transition()
	      		.duration(s.duration)
	      		.remove();

	      	(s.barStyle) 
	      		? barsEnter.attr('style', function(d) { return s.barStyle+"fill:"+self.colorScale(d.name)+";"; })
	      		: barsEnter.attr('style', function(d) { return "fill:"+self.colorScale(d.name)+";"; });
		
			// add value labels if set
			if(s.valueLabels) {
				barText = bars.enter().append('text')
	  				.attr('class', function(d, i) { return 'value-label '+d.name; })
		  			.attr('x', function(d) { return self.xScale1(d.name) + s.barWidth/2; })
			      	.attr("y", function(d) { 
			      		return vis.yScale(self, d) + s.margin.top - s.valueLabels.padding; 
			      	})
			      	.attr('text-anchor', s.valueLabels.anchor)
					.text(function(d) { return d3.format(s.valueLabels.format)(d.value); });

				(s.valueLabels.style)
					? barText.attr('style', s.valueLabels.style)
					: barText.attr('style', "fill:"+s.valueLabels.fill+";")
			}

		}

		bar.container = container;
		bar.build();
		return bar;
	}
})();




