let data1 = [
        ['Decade', 't-value', 'p-value (one-tail)', 'p-value (one-tail)'],
        ['1950s', 5.05, 0, 0],
        ['1960s', 7.11, 0, 0],
        ['1970s', 9.69, 0, 0],
        ['1990s', 7.19, 0, 0],
        ['2000s', 2.29, 0.02, 0.04],
        ['2010s', 4.62, 0, 0]
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
            return { value: d, isHeader: rowIndex === 0 }; // Identify headers in the first row
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

const table1 = createTable('#table1', data1);

