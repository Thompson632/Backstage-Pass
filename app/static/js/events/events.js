function Events(numRows) {

    const EVENTS_PER_PAGE = numRows;
    const EVENTS_PER_COL = 4;

    this.buildEventCard = (event) => {
        return $(`
        <div class="col col-md-3 mb-4">
          <div class="card box-shadow">
            <img src="/static/img/events/${event.event_image}" class="card-img-top" alt="...">
            <div class="card-body">
              <h5 class="card-title text-truncate">${event.event_name}</h5>
              <p class="card-subtitle text-muted mb-2 text-truncate">${event.artist}</p>
              <div class="d-flex flex-column">
                <span class="card-text">
                  <small class="text-muted">
                    <span class="event-start-date">${event.start_date}</span> at 
                    <span class="event-start-time">${event.start_time}</span>
                  </small>
                </span>
                <span class="card-text"><small class="text-muted">${event.city}, ${event.state}</small></span>
              </div>
            </div>
          </div>
        </div>
        `);
    };

    this.buildEventCards = (events) => {
        const container = $('#placeholder');
        let row; 
        events.forEach((event, i) => {
            const eventCard = this.buildEventCard(event);
            if (i % EVENTS_PER_COL == 0) {
                row = $('<div class="row"></div>');
            }

            row.append(eventCard);
            container.append(row)
        });
    }
  
    this.buildEventTable = (events) => {
        $('#maintable').empty();
        if (events != null) {
          const t_headers = $(`
                  <tr>
                      <th scope="col">Image</th>
                      <th data-field="name" data-filter-control="select" scope="col">Event Name  <img></th>
                      <th data-field="city" data-filter-control="select" scope="col">City        <img></th>
                      <th scope="col">From        <img></th>
                      <th scope="col">To          <img></th>
                      <th data-field="artist" data-filter-control="select" scope="col" scope="col">Artist      <img></th>
                  <tr>`);
      //   if (events.length > 0) {
            const thead = $(`<thead></thead>`);
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
                <h1>0 events found.</h1>
            `);
            // Find all select elements within the modal body
            var selectElements = document.getElementById('bn');
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
    
  
    const createPageLink = (text, toPage, active, disabled, search_events     , filter_event_name , filter_city_name
      , filter_artist_name, filter_from_date  , filter_to_date) => {
      const link = $(`
          <li class="page-item">
              <a class="page-link">${text}</a>
          </li>
      `);
      $(link).find('.page-link').on('click', _ => {
          this.currentPage = toPage;
          this.load(search_events     , filter_event_name , filter_city_name
              , filter_artist_name, filter_from_date  , filter_to_date);
      });
      if (active)
          link.addClass('active');
      if (disabled)
          link.addClass('disabled');
      return link;
  }
  
  this.currentPage = 1;
  
  this.updatePagination = (total, search_events     , filter_event_name , filter_city_name
      , filter_artist_name, filter_from_date  , filter_to_date) => {
      let pages = Math.ceil(total[0].total_event_count / EVENTS_PER_PAGE);
      $('#paginator').empty().append(
          createPageLink('Previous', this.currentPage - 1, false, this.currentPage == 1, search_events     , filter_event_name , filter_city_name
          , filter_artist_name, filter_from_date  , filter_to_date)
      );
      for (let page = 1; page <= pages; page++)
          $('#paginator').append(
              createPageLink(page, page, page == this.currentPage, false, search_events     , filter_event_name , filter_city_name
                  , filter_artist_name, filter_from_date  , filter_to_date)
          );
      $('#paginator').append(
          createPageLink('Next', this.currentPage + 1, false, this.currentPage == pages, search_events     , filter_event_name , filter_city_name
          , filter_artist_name, filter_from_date  , filter_to_date)
      );
  }
  
  
    this.build = (data , search_events     , filter_event_name , filter_city_name
                       , filter_artist_name, filter_from_date  , filter_to_date) => {
          this.buildEventTable(data.events);
          this.buildEventCards(data.events);
          this.buildFilterEvents(data.event_names);
          this.buildFilterCity(data.city_names);
          this.buildFilterArtist(data.artist_names);
          this.updatePagination(data.total, search_events     , filter_event_name , filter_city_name
              , filter_artist_name, filter_from_date  , filter_to_date)
    }
  
    this.load = (     search_events      ,   filter_event_name  , filter_city_name
                  ,   filter_artist_name ,    filter_from_date  , filter_to_date) => {
          var filter_event_par = []
          var filter_city_par = []
          var filter_artist_par = []
  
          filter_event_name.forEach(function(item){
          filter_event_par.push(item)
          });
  
          filter_city_name.forEach(function(item){
          filter_city_par.push(item)
          });
  
          filter_artist_name.forEach(function(item){
          filter_artist_par.push(item)
          });
  
          filter_from_date_par = filter_from_date
          $.get('/api/get_events', {
                      n: EVENTS_PER_PAGE
                  ,   offset: (this.currentPage - 1) * EVENTS_PER_PAGE
                  ,   search_events: search_events              
                  ,   filter_event_name: filter_event_par
                  ,   filter_city_name: filter_city_par
                  ,   filter_artist_name: filter_artist_par
                  ,   filter_from_date: filter_from_date
                  ,   filter_to_date: filter_to_date
              }
          , (data) => {
                  this.build(data
                      , search_events     , filter_event_name , filter_city_name
                      , filter_artist_name, filter_from_date  , filter_to_date);    
              });
    }
  
  }