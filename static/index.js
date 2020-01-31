// Create new channel button active
document.addEventListener('DOMContentLoaded', () => {
        
    // Connect to websocket
    var socket = io.connect(location.protocol +'//' + document.domain + ':' + location.port);

    // Detect if name already exist in local stroage
    if (localStorage.getItem('name')) {
        const local_name = localStorage.getItem('name');
        document.querySelector('#current_name').innerHTML = local_name;
        const local_color = localStorage.getItem('icon_color');
        console.log('local color exists: ',local_color)
        document.querySelector('#selected_color').style.backgroundColor = local_color;
    };

    // Detect if color already exist in local stroage
    if (localStorage.getItem('icon_color')) {
        const local_color = localStorage.getItem('icon_color');
        console.log('local color exists: ',local_color)
        document.querySelector('#selected_color').style.backgroundColor = local_color;
    };

    // Detect if channel already exist in local stroage
    if (localStorage.getItem('channel')) {
        const local_channel = localStorage.getItem('channel');
        console.log('local channel found')
        socket.emit('check channel', {'channel': local_channel });
        socket.on('check channel result', data => {
            if (data.result === 'yes') {
                console.log('local channel in msg_data')
                document.querySelector('#channel_bar').innerHTML = local_channel;
                document.querySelector('#channel_bar').style = "background-color: ; color: black;";}
            else {
                console.log('local channel not match')
                localStorage.setItem('channel', null)
                document.querySelector('#channel_bar').innerHTML = "Create or choose a channel";
                document.querySelector('#channel_bar').style = "background-color: yellow; color:red;";}
        });
    }
    else {
        document.querySelector('#channel_bar').innerHTML = "Create or choose a channel";
        document.querySelector('#channel_bar').style = "background-color: yellow; color:red;";
        console.log('local channel not found ');
    };


    // 訊息視窗自動滑到最底的的函式  （當送出新訊息時，來觸動這個函式）
    var elmnt = document.getElementById("msglist_div");
    function scrollToBottom() {
        elmnt.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
    };

    scrollToBottom();
    msg_view();
    logout_display();
    name_edit();
    setIconColor();
    

    // Connect to websocket
    var socket = io.connect(location.protocol +'//' + document.domain + ':' + location.port);


    // Function : Change Channel
    document.querySelectorAll(".channel").forEach(button => {
        button.onclick = () => {
            const select = button.dataset.channel;
            socket.emit('change channel', {'select': select});
            localStorage.setItem('channel', select);
            document.querySelector('#channel_bar').innerHTML = select;
            document.querySelector('#channel_bar').style = "background-color: ; color: black;";

            msg_view();
            scrollToBottom();
            return false;
        };
    });


    // Function : Send Message 1 via button
    document.querySelector('#sendmsg').onclick = () => {
        const name = localStorage.getItem('name');
        const channel = localStorage.getItem('channel');
        console.log("channel=", channel)
        if (channel == "" || channel == "null") {
            alert("Create or choose a channel first!")
        }
        const text = document.querySelector('#msgtext').value;
        const date = new Date(Date.now());
        const icon_color = document.querySelector('#selected_color').style.backgroundColor;
        const new_msg = [name, date, text, icon_color];

        socket.emit('new msg', {'new_msg': new_msg , 'channel': channel });
        document.querySelector('#msgtext').value = '';
        return false;
    };

    // Function : Send Message 2 via enter
    document.querySelector('#msg_edit').onsubmit = () => {
        const name = localStorage.getItem('name');
        const channel = localStorage.getItem('channel');
        const text = document.querySelector('#msgtext').value;
        const date = new Date(Date.now());
        const icon_color = document.querySelector('#selected_color').style.backgroundColor;
        const new_msg = [name, date, text, icon_color];
        console.log('------');
        console.log('channel=', channel, 'new_msg=', new_msg);
        socket.emit('new msg', {'new_msg': new_msg , 'channel': channel });
        document.querySelector('#msgtext').value = '';
        return false;
    };
    
    // Update Message Viewer
    socket.on('update msglist', data => {
        console.log('data.channel : ', data.channel)
        if (data.channel == localStorage.getItem('channel')) {
        const local_date = new Date(data.select[1]);
        h = addZero(local_date.getHours());
        m = addZero(local_date.getMinutes());

        const tr = document.createElement('tr');
        const td = tr.appendChild(document.createElement('td'));

        const div_row = td.appendChild(document.createElement('div'));
        const color_box = div_row.appendChild(document.createElement('button'));
        color_box.setAttribute('class', 'icon');
        color_box.disabled = true;
        color_box.style = "width:15px; height:15px;";
        color_box.style.backgroundColor = data.select[3];
        const span_name = div_row.appendChild(document.createElement('span'));
        const span_time = div_row.appendChild(document.createElement('span'));
        span_name.setAttribute('class', 'span_name');
        span_time.setAttribute('class', 'span_time');
        span_name.innerHTML = " " + data.select[0];
        span_time.innerHTML = " " + h + " : " + m;

        const div_msg = td.appendChild(document.createElement('div'));        
        div_msg.setAttribute('class', 'div_msg');
        div_msg.innerHTML = "> " + data.select[2];

        document.querySelector('#msglist').append(tr);          

        scrollToBottom();}
    });


    // NEW CHANNEL BUTTON: Detect if input valid
    document.querySelector('#new_ch').disabled = true;
    document.querySelector('#new_ch_name').onkeyup = () => {
        if (document.querySelector('#new_ch_name').value.length > 0)
            document.querySelector('#new_ch').disabled = false;
        else
            document.querySelector('#new_ch').disabled = true;
    };
    document.querySelector('#new_ch').onsubmit = () => {
        document.querySelector('#new_ch_name').value = '';
        document.querySelector('#new_ch').disabled = true;
    };
    
    // Log out function trigger setting
    document.querySelector('#icon_logout_div').onclick = () => {
        document.querySelector('#current_name').innerHTML = '';
        document.querySelector('#selected_color').style.backgroundColor = "white";
        document.querySelector('#channel_bar').innerHTML = "Create or choose a channel";
        document.querySelector('#channel_bar').style = "background-color: yellow; color:red;";
        localStorage.setItem('name','');
        localStorage.setItem('channel','');
        localStorage.setItem('icon_color',null);
        
        logout_display();
        setIconColor();
        name_edit();
        msg_view();
        return false;
    };



    // SEND BUTTON: Detect if 'name' exist to able/disable
    function send_disable () {
        const msgtext_msg = document.querySelector("#msgtext");
        // // Enable button only if there is text in the input field
        if (!document.querySelector('#current_name').innerHTML ) {
            msgtext_msg.placeholder = "Please enter your name before sending messages.";
            document.querySelector('#sendmsg').disabled = true;
        }     
        else if (document.querySelector('#current_name').innerHTML ) {
            document.querySelector('#sendmsg').disabled = false;
            msgtext_msg.placeholder = "Send a message!";
        };
    };


    // LOG OUT BUTTON: Detect if input valid
    function logout_display () {
        if (localStorage.getItem('name')) {
            const icon = document.createElement('img');
            icon.setAttribute('id', 'icon_logout');
            icon.src = "../static/icon_logout.svg";
            document.querySelector('#icon_logout_div').append(icon);
        }
        else 
            document.querySelector('#icon_logout_div').innerHTML = "";   
        send_disable();    
    };


    // Change the color of the heading when dropdown changes
    function setIconColor () {
        if (localStorage.getItem('icon_color') == "null" || localStorage.getItem('icon_color') == null) {
            console.log('setIconColor work')
            document.querySelector('#color_change_div').innerHTML = "";
            const select = document.createElement('select');
            select.setAttribute('id', 'color_change');
            const color = select.appendChild(document.createElement('option'));
            color.selected = true;
            color.innerHTML = "Color";
            const black = select.appendChild(document.createElement('option'));
            black.value = "black";
            black.innerHTML = "Black";
            const red = select.appendChild(document.createElement('option'));
            red.value = "Crimson";
            red.innerHTML = "Red";
            const orange = select.appendChild(document.createElement('option'));
            orange.value = "Tomato";
            orange.innerHTML = "Orange";
            const yellow = select.appendChild(document.createElement('option'));
            yellow.value = "yellow";
            yellow.innerHTML = "Yellow";
            const green = select.appendChild(document.createElement('option'));
            green.value = "ForestGreen";
            green.innerHTML = "Green";
            const Blue = select.appendChild(document.createElement('option'));
            Blue.value = "SteelBlue";
            Blue.innerHTML = "Blue";
            const navy = select.appendChild(document.createElement('option'));
            navy.value = "navy";
            navy.innerHTML = "Navy";
            const purple = select.appendChild(document.createElement('option'));
            purple.value = "Indigo";
            purple.innerHTML = "Purple";
            const gray = select.appendChild(document.createElement('option'));
            gray.value = "gray";
            gray.innerHTML = "Gary";
           
            document.querySelector('#color_change_div').append(select);
            document.querySelector('#color_change').onchange = function() {
                document.querySelector('#selected_color').style.backgroundColor = this.value;
            };
        }
        else if (localStorage.getItem('icon_color') != "") {
            console.log('setIconColor not work')
            document.querySelector('#color_change_div').innerHTML = " ";

        }
    }
    // NAME EDITOR : 
    function name_edit () {
        if (!localStorage.getItem('name')) {
            const new_input = document.createElement('input');
            new_input.placeholder = "Your name";
            new_input.type = "text";
            new_input.setAttribute("id", "newname");
            
            const icon = document.createElement('button');
            icon.setAttribute("id", "newname_go");
            
            document.querySelector('#change_name').append(new_input);
            document.querySelector('#change_name').append(icon);
            
            document.querySelector('#newname_go').disabled = true;
            document.querySelector('#newname').onkeyup = () => {
                if (document.querySelector('#newname').value.length > 0)
                    document.querySelector('#newname_go').disabled = false;
                else
                    document.querySelector('#newname_go').disabled = true;
            };
            
            document.querySelector('#newname_go').onclick = () => {
                const new_name = document.querySelector('#newname').value;
                document.querySelector('#current_name').innerHTML = " " + new_name;
                document.querySelector('#newname').value = '';
                if (document.querySelector('#color_change').value == 'Color') {
                    var icon_color = "white";}
                else {
                    var icon_color = document.querySelector('#color_change').value;}
                // Update new_name in localStorage
                localStorage.setItem('name',new_name);
                localStorage.setItem('icon_color', icon_color);
                document.querySelector('#selected_color').style.backgroundColor = icon_color;
                logout_display();
                send_disable();
                setIconColor();
                document.querySelector('#change_name').innerHTML = "";   
                return false;
            };
        }
        else
            document.querySelector('#change_name').innerHTML = "";   
    };


    function msg_view () {
        // 訊息視窗自動滑到最底的的函式  （當送出新訊息時，來觸動這個函式）
        var elmnt = document.getElementById("msglist_div");
        function scrollToBottom() {
            elmnt.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"}); 
        };
        
        var socket = io.connect(location.protocol +'//' + document.domain + ':' + location.port);
        // 如果localstorage裡面有存channel，則自動呼喚“帶入該channel”的function
        const local_channel = localStorage.getItem('channel');
        socket.emit('default msg', {'channel': local_channel });
        
        socket.on('msg view', data => {
            document.querySelector('#msglist').innerHTML = '';    
            var msg_list = data.select.values();
            for (let msg of msg_list) {
                const local_date = new Date(msg[1])
                h = addZero(local_date.getHours());
                m = addZero(local_date.getMinutes());
        
                const tr = document.createElement('tr');
                const td = tr.appendChild(document.createElement('td'));
            
                const div_row = td.appendChild(document.createElement('div'));
    
                const color_box = div_row.appendChild(document.createElement('button'));
                color_box.setAttribute('class', 'icon');
                color_box.disabled = true;
                color_box.style = "width:15px; height:15px;";
                color_box.style.backgroundColor = msg[3];
                const span_name = div_row.appendChild(document.createElement('span'));
                span_name.setAttribute('class', 'span_name');
                const span_time = div_row.appendChild(document.createElement('span'));
                span_time.setAttribute('class', 'span_time');
                span_name.innerHTML = " " + msg[0];
                span_time.innerHTML = " " + h + " : " + m;
        
                const div_msg = td.appendChild(document.createElement('div'));        
                div_msg.setAttribute('class', 'div_msg');
                div_msg.innerHTML = "> " + msg[2];
        
                document.querySelector('#msglist').append(tr);  
            };
            scrollToBottom();
        });
    };
});


function addZero(i) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
}


