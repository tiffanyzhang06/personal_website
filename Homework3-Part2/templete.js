// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.Likes = +d.Likes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;
    let margin = {top: 30, bottom: 50, left: 60, right: 30};

    // Create the SVG container
    let svg = d3.select("#boxplot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style('background', 'lightyellow');

    // adding a title for the side-by-side boxplot
    svg.append("text")
      .text("Distribution of the Number of Likes Across the Age Groups")
      .attr("x", width/2)
      .attr("y", margin.top/2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px");

    // Set up scales for x and y axes
    // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
    // d3.min(data, d => d.Likes) to achieve the min value and 
    // d3.max(data, d => d.Likes) to achieve the max value
    // For the domain of the xscale, you can list all three age groups or use
    // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group
    let xScale = d3.scaleBand()
        .domain([...new Set(data.map(d => d.AgeGroup))])
        .range([margin.left, width - margin.right])
        .padding(0.5);

    let yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.Likes), d3.max(data, d => d.Likes)])
        .range([height - margin.bottom, margin.top]);

    // Add scales
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Add x-axis label
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height - margin.bottom + 40)
      .attr("text-anchor", "middle")
      .text("Age Group")
      .style("font-size", "12px");
    
    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Number of Likes")
      .style("font-size", "12px");

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.Likes).sort(d3.ascending);
        const min = d3.min(values); 
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const max = d3.max(values);
        return {min, q1, median, q3, max};
    };
    
    // This code groups the data by AgeGroup and then it calculates the min, Q1, median, Q3, and max values for each group
    const quantilesByGroups = d3.rollup(data, rollupFunction, d => d.AgeGroup);

    // This code goes through each AgeGroup and the calculated values (min, Q1, median, Q3, max) and finds the x-position 
    // and the width of each boxplot on the graph
    quantilesByGroups.forEach((quantiles, AgeGroup) => {
        const x = xScale(AgeGroup);
        const boxWidth = xScale.bandwidth();

        // Draw vertical lines
        svg.append("line")
          .attr("x1", x + boxWidth/2)
          .attr("x2", x + boxWidth/2)
          .attr("y1", yScale(quantiles.min))
          .attr("y2", yScale(quantiles.max))
          .attr("stroke", "black");

        // Draw box
        svg.append("rect")
          .attr("x", x)
          .attr("y", yScale(quantiles.q3))
          .attr("width", boxWidth)
          .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
          .attr("fill", "lightyellow")
          .attr("stroke", "black");

        // Draw median line
        svg.append("line")
          .attr("x1", x)
          .attr("x2", x + boxWidth)
          .attr("y1", yScale(quantiles.median))
          .attr("y2", yScale(quantiles.median))
          .attr("stroke", "black");

    });
});

// Prepare you data and load the data again. 
// This data should contains three columns, platform, post type and average number of likes. 
const socialMediaAvg = d3.csv("socialMediaAvg.csv");

socialMediaAvg.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;
    let margin = {top: 30, bottom: 50, left: 60, right: 30};

    // Create the SVG container
    let svg = d3.select("#barplot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style('background', 'lightyellow');

    // adding a title for the side-by-side bar plot
    svg.append("text")
      .text("Average Likes by Platform and Post Type")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px");

    // Define four scales
    // Scale x0 is for the platform, which divide the whole scale into 4 parts
    // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
    // Recommend to add more spaces for the y scale for the legend
    // Also need a color scale for the post type

    const x0 = d3.scaleBand()
      .domain([...new Set(data.map(d => d.Platform))])
      .range([margin.left, width - margin.right])
      .padding(0.5);

    const x1 = d3.scaleBand()
      .domain([...new Set(data.map(d => d.PostType))])
      .range([0, x0.bandwidth()])
      .padding(0.05);
      
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes)])
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal()
      .domain([...new Set(data.map(d => d.PostType))])
      .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);    
         
    // Add scales x0 and y
    svg.append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0));
    
    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // Add x-axis label
    svg.append("text")
      .attr("x", width/2)
      .attr("y", height - margin.bottom + 40)
      .attr("text-anchor", "middle")
      .text("Platform")
      .style("font-size", "12px");

    // Add y-axis label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height/2)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .text("Number of Likes")
      .style("font-size", "12px");

  // Group container for bars
  const barGroups = svg.selectAll("bar")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", d => `translate(${x0(d.Platform)},0)`);

  // Draw bars
  barGroups.append("rect")
    .attr("x", d => x1(d.PostType))
    .attr("y", d => y(d.AvgLikes))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - margin.bottom - y(d.AvgLikes))
    .attr("fill", d => color(d.PostType));

    // Add the legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - 68}, ${margin.top})`);

    const types = [...new Set(data.map(d => d.PostType))];
 
    types.forEach((type, i) => {

    // Alread have the text information for the legend. 
    // Now add a small square/rect bar next to the text with different color.
      legend.append("text")
          .attr("x", 20)
          .attr("y", i * 20 + 12)
          .text(type)
          .attr("alignment-baseline", "middle");

      legend.append("rect")
          .attr("x", 0)
          .attr("y", i * 20)
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", color(type));
  });

});

// Prepare you data and load the data again. 
// This data should contains two columns, date (3/1-3/7) and average number of likes. 

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.AvgLikes = +d.AvgLikes;
    });

    // Define the dimensions and margins for the SVG
    let width = 600, height = 400;
    let margin = {top: 40, bottom: 90, left: 60, right: 30};

    // Create the SVG container
    let svg = d3.select("#lineplot")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style('background', 'lightyellow');

    // adding a title for the line plot
    svg.append("text")
      .text("Average Likes Over Time")
      .attr("x", width/2)
      .attr("y", margin.top/2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px");

    // Set up scales for x and y axes  
    let yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AvgLikes)])
      .range([height - margin.bottom, margin.top])
    
    let xScale = d3.scaleBand()
      .domain(data.map(d => d.Date))
      .range([margin.left, width - margin.right])

    // Draw the axis, you can rotate the text in the x-axis here
    let xAxis = svg.append('g')
      .call(d3.axisBottom().scale(xScale))
      .attr('transform', `translate(0, ${height - margin.bottom})`)

    xAxis.selectAll("text")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

    let yAxis = svg.append('g')
      .call(d3.axisLeft().scale(yScale))
      .attr('transform', `translate(${margin.left}, 0)`)

    // Add x-axis label
    svg.append('text')
      .attr('x', width/2)
      .attr('y', height - 15)
      .style('text-anchor', 'middle')
      .text('Date')
      .style("font-size", "12px");

    // Add y-axis label
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', 0 - height/2)
      .attr('y', 20)
      .style('text-anchor','middle')
      .text('Number of Likes')
      .style("font-size", "12px");

    // Draw the line and path. Remember to use curveNatural. 
    let line = d3.line()
      .x(d => xScale(d.Date) + xScale.bandwidth()/2)
      .y(d => yScale(d.AvgLikes))
      .curve(d3.curveNatural)

    let path = svg.append('path')
      .datum(data)
      .attr('d', line)
      .attr('stroke', 'red')
      .attr('fill', 'none')
});
