d3.json('treemap-data.json').then(data => {
    let height = 580,
      width = 1000;
  
    const treemap = data => d3.treemap()
      (d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value));
  
    const x = d3.scaleLinear().rangeRound([0, width]);
    const y = d3.scaleLinear().rangeRound([0, height]);
  
    const format = d3.format(",d");
  
    const svg = d3.select("#chart")
      .append("svg")
      .attr("viewBox", [0, 0, width, height]);
  
    let group = svg.append("g")
      .call(render, treemap(data));
  
    function render(group, node) {
      d3.select('#breadcrumbs')
        .text(node.ancestors().reverse().map(d => d.data.name).join(" > "))
        .on('click', () => {
          if (node.parent) {
            zoomOut(node);
          }
        });
  
      const gNode = group
        .selectAll("g")
        .data(node.children)
        .join("g");
  
      gNode.filter(d => d.children)
        .attr("cursor", "pointer")
        .on("click", (event, d) => zoomIn(d));
  
      gNode.append("rect")
        .attr("fill", d => d.data.color)
        .attr("fill-opacity", d => d.data.opacity)
        .attr("stroke", "#fff");

      // gNode.append("image")
      //   .attr("href", "<URL>")
      //   .attr("width", 500)
      //   .attr("x", 50)
      //   .attr("y", 50)

      gNode.append("text")
        .attr("writing-mode", function(d) {
          if (d.data.name == "Community") {return "tb"}
          else 	{ return "rl" }
          ;})
        .append("tspan")
        .attr("x", function(d) {
          if (d.data.name == "Community") {return "3.2em"}
          else 	{ return 5 }
          ;})
          .attr("y", function(d) {
            if (d.data.name == "Community") {return ".3em"}
            else 	{ return "1.1em" }
            ;})
        .attr("font-size", d => d.data.txtsize)
        .text(d => d.data.name)
        .append("tspan")
        .attr("x", function(d) {
          if (d.data.name == "Community") {return "2em"}
          if (d.data.name == "Farms") {return "3.7em"}
          if (d.data.name == "Middle Eastern") {return "8em"}
          else 	{ return 5 }
          ;})
          .attr("y", function(d) {
            if (d.data.name == "Community") {return ".3em"}
            if (d.data.name == "Farms") {return "1.1em"}
            if (d.data.name == "Middle Eastern") {return "1.1em"}
            else 	{ return "2.3em" }
            ;})
        .text(d => format(d.value));
  
      group.call(position);
    }
  
    function position(group) {
      group.selectAll("g")
        .attr("transform", d => `translate(${x(d.x0)},${y(d.y0)})`)
        .select("rect")
        .attr("width", d => x(d.x1) - x(d.x0))
        .attr("height", d => y(d.y1) - y(d.y0));
    }
  
    function zoomIn(d) {
      const group0 = group.attr("pointer-events", "none");
      const group1 = group = svg.append("g").call(render, d);
  
      x.domain([d.x0, d.x1]);
      y.domain([d.y0, d.y1]);
  
      svg.transition()
        .duration(750)
        .call(t => group0.attr("opacity", 1)
          .transition(t)
          .attr("opacity", 0.1)
          .remove()
          .call(position, d.parent))
        .call(t => group1.attr("opacity", 0)
          .transition(t)
          .attr("opacity", 1)
          .call(position, d));
    }
  
    function zoomOut(d) {
      const group0 = group.attr("pointer-events", "none");
      const group1 = group = svg.insert("g", "*").call(render, d.parent);
  
      x.domain([d.parent.x0, d.parent.x1]);
      y.domain([d.parent.y0, d.parent.y1]);
  
      svg.transition()
        .duration(750)
        .call(t => group0.attr("opacity", 1)
          .transition(t).remove()
          .attr("opacity", 0)
          .call(position, d))
        .call(t => group1.attr("opacity", 0.1)
          .transition(t)
          .attr("opacity", 1)
          .call(position, d.parent));
    }
  });