    let data1 = [
        ['', 'Architecture & Design','Drawings & Prints','Media & Performance','Painting & Sculpture','Photography','Total'],
        ['Male', 1709,3698,272,784,1536,7999],
        ['Non-male', 231,960,174,161,405,1931],
        ['Total', 1940,4658,446,945,1941,9930],     
    ];

    let data2 = [
        ['', 'Architecture & Design','Drawings & Prints','Media & Performance','Painting & Sculpture','Photography'],
        ['Male', 1562.74,3752.20,359.27,761.23,1563.55],
        ['Non-male', 377.25,905.80,86.73,183.77,377.45],
        
        ];

    let data3 = [
        ['', 'Architecture & Design','Drawings & Prints','Media & Performance','Painting & Sculpture','Photography'],
        ['Male', 9.35,-2.75,- 10.68,1.97,-1.76],
        ['Non-male', -9.35,2.75,10.68,-1.97,1.76],
        
        ];


function createTable(container, data) {
    const table = d3.select(container).append('table');

    const rows = table.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    const cells = rows.selectAll('td, th') 
    .data(function (row, rowIndex) {
        return row.map(function(d, i) {
            return { value: d, isHeader: rowIndex === 0 }; 
        });
    })
    .enter()
    .append(function(d) {
        return d.isHeader ? document.createElement('th') : document.createElement('td');
    })
    .text(function (d) {
        return d.value;
    })
    .classed('header-hover', function(d) {
        return d.isHeader; 
    });
    return table;
}

const table1 = createTable('#ofreq', data1);

const table2 = createTable('#efreq', data2);

const table3 = createTable('#sres', data3);