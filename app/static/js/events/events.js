function Events() {
  this.buildEventTable = (events) => {
      $('#maintable').empty();
      const t_headers = $(`
          <tr>
              <th scope="col">Image</th>
              <th data-field="name" data-filter-control="select" scope="col">Event Name  <img></th>
              <th data-field="city" data-filter-control="select" scope="col">City        <img></th>
              <th scope="col">From        <img></th>
              <th scope="col">To          <img></th>
              <th data-field="artist" data-filter-control="select" scope="col" scope="col">Artist      <img></th>
          <tr>`);
      if (events.length > 0) {
          const thead = $(`<thead class="thead-light"></thead>`);
          thead.append(t_headers);

          $('#maintable').append(thead);

          const tbody = $(`<tbody></tbody>`);
          for (let col = 0; col < events.length; col++) {
                  const event = events[col];
                  const dataRow = $(`
                      <tr onclick="window.location='/events/event_details?event_id=${event.event_id}'">
                          <td><img class="table-imgs" src="/static/img/events/${event.event_image}"></td>
                          <td>${event.event_name}</a></td>
                          <td>${event.city}</td>
                          <td>${event.start_date} ${event.start_time}</td>
                          <td>${event.end_date} ${event.end_time}</td>
                          <td>${event.artist}</td>
                      </tr>
                  `);

                  $(tbody).append(dataRow);
              } 
          $('#maintable').append(tbody);
          const tfoot = $(`<tfoot></tfoot>`);
          tfoot.append(t_headers.clone());

          $('#maintable').append(tfoot);

          
          // JQuery code to sort by columns on the page
          $('th').click(function(){
              var table = $(this).parents('table').eq(0);
              var tbody = table.find('tbody');
              var rows = tbody.find('tr').toArray().sort(comparer($(this).index()));
              this.asc = !this.asc
              if (!this.asc){rows = rows.reverse()}
              for (var i = 0; i < rows.length; i++){
                  tbody.append(rows[i]);
              }
            })
          function comparer(index) {
              return function(a, b) {
                  var valA = getCellValue(a, index), valB = getCellValue(b, index)
                  return $.isNumeric(valA) && $.isNumeric(valB) ? valA - valB : valA.toString().localeCompare(valB)
              }
            }

          function getCellValue(row, index){ return $(row).children('td').eq(index).text() }
    
      }
      else {
              const noDataFound = $(`
              <p>No events found!</p>
          `);
          $('#maintable').append(noDataFound);
      }

  }
  
  this.buildFilterEvents = (events) => {
      $('#formControlEventName').empty();
      
      events.forEach(function(item){
          const optionTag = $(`
                      <option>${item.event_name}</option>
                      `);
          $('#formControlEventName').append(optionTag)
      });

  }

  this.buildFilterCity = (cities) => {
      $('#formControlCity').empty();
      
      cities.forEach(function(item){
          const optionTag = $(`
                      <option>${item.city}</option>
                      `);
          $('#formControlCity').append(optionTag)
      });
  }
  
  this.buildFilterArtist = (artists) => {
      $('#formControlArtist').empty();
      
      artists.forEach(function(item){
          const optionTag = $(`
                      <option>${item.artist}</option>
                      `);
          $('#formControlArtist').append(optionTag)
      });
  }    
  
  this.build = (data) => {
      this.buildEventTable(data.events);
      this.buildFilterEvents(data.event_names);
      this.buildFilterCity(data.city_names);
      this.buildFilterArtist(data.artist_names);
  }

  this.load = (search_events, filter_event_name) => {
      // alert(filter_event_name)
      var filter_par = []
      filter_event_name.forEach(function(item){
          filter_par.push(item)
          alert(item)
      });
      
      // filter_par.push('Hi')
      // filter_par.push('There')
      // alert(filter_par_e)
      if (filter_event_name.length == 0)
          $.get('/api/get_events', {
              search_events: search_events,               
              filter_event_name: filter_par.join(',')
          }, (data) => {
              this.build(data);
          });
      else
          $.post('/api/get_events', {
              search_events: search_events,
              filter_event_name: filter_par.join(',')
          }, (data) => {
              this.build(data);
          });            
  }

}