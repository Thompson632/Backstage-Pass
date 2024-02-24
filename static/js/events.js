function Events() {
    this.updateRowData = (events) => {
        $('#maintable').empty();
        if (events.length > 0) {
            const thead = $(`
                <thead class="thead-light">
                    <tr>
                        <th scope="col">Image</th>
                        <th scope="col">Event Name</th>
                        <th scope="col">City</th>
                        <th scope="col">From</th>
                        <th scope="col">To</th>
                        <th scope="col">Artist</th>
                    </tr>
                </thead>`);

            $('#maintable').append(thead);

            const tbody = $(`<tbody></tbody>`);
            for (let col = 0; col < events.length; col++) {
                    const event = events[col];
                    const dataRow = $(`
                        <tr scope="row">
                            <td><img class="table-imgs" src="/static/img/events/${event.event_image}"></td>
                            <td>${event.event_name}</td>
                            <td>${event.city}</td>
                            <td>${event.start_date} ${event.start_time}</td>
                            <td>${event.end_date} ${event.end_time}</td>
                            <td>${event.artist}</td>
                          </tr>
                    `);

                    $(tbody).append(dataRow);
                } 
            $('#maintable').append(tbody);
            
            }
            else {
                    const noDataFound = $(`
                    <p>No events found!</p>
                `);
                $('#maintable').append(noDataFound);
            }
    }

    this.update = (data) => {
        this.updateRowData(data.events);
    }

    this.load = () => {
        $.get('/api/get_events', {
        }, (data) => {
            this.update(data);
        });
    }
}