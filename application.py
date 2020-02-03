import os
from datetime import timedelta

from flask import Flask, render_template, request
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["SEND_FILE_MAX_AGE_DEFAULT"] = timedelta(seconds=1)
socketio = SocketIO(app)


#For heroku
if os.getenv("SECRET_KEY") is None:
    app.config["SECRET_KEY"] = "gogopeggy"

msg_data = {}

@app.route("/")
def index():
    return render_template('index.html', ch_list=msg_data, msg_data=msg_data, create_err="")

@app.route("/", methods=["POST","GET"])
def create_ch():
    ch_name = request.form.get("ch_name")
    if ch_name in msg_data:
        return render_template('index.html', ch_list=msg_data, msg_data=msg_data, create_err="Channel already exists.")
    msg_data[ch_name] = []
    return render_template('index.html', ch_list=msg_data, msg_data=msg_data, create_err="")


@socketio.on("change channel")
def change(data):
    msglist = msg_data[data['select']]
    emit('show msglist', {'select': msglist} , broadcast=False)

@socketio.on("new msg")
def msg_add(data):
    new_msg = data['new_msg']
    channel = data['channel']
    if channel not in msg_data:
        pass
    else:
        if len(msg_data[channel]) == 100:
            del msg_data[channel][0]
        msg_data[channel].append(new_msg)

        msg = msg_data[channel][-1]
        emit('update msglist', {'select': msg, 'channel': channel} , broadcast=True)
    

@socketio.on("default msg")
def msg_view(data):
    channel = data['channel']
    try:
        msglist = msg_data[channel]
    except:
        msglist = []
    emit('msg view', {'select': msglist} , broadcast=False)


@socketio.on("check channel")
def channel_check(data):
    channel = data['channel']
    if channel in msg_data:
        emit('check channel result', {'result': "yes"} , broadcast=False)
    else:
        emit('check channel result', {'result': "no"} , broadcast=False)


@app.route("/reset")
def reset():
    msg_data = {}
    return render_template('index.html', ch_list=msg_data, msg_data="", create_err="")


if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
