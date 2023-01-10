class PresenceList extends UiComponent {

  constructor(options) {
    super("div", 'presence-pane');
    this._options = options;
    this._sessions = {};

    const title = $("<div class='presence-title'>Users</div>");
    this._el.append(title);

    this._sessionList = $("<div />", {class: "session-list"});
    this._el.append(this._sessionList);
    this._init();
  }

  _init() {
    const participants = this._options.activity.participants().sort((a, b) => a.local ? -1 : 1);
    var i=1
    participants.forEach((participant) => {
      this._addSession(participant);
      i++
    });
    console.log("Number of participants is: ",i)

    this._options.activity.on("session_joined", (e) => {
      this._addSession(e.participant);
      console.log('participant', e.participant.user.displayName)
      Toastify({
        text: e.participant.user.displayName+" joined!",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function(){} // Callback after click
      }).showToast();
    });

    this._options.activity.on("session_left", (e) => {
      this._removeSession(e.sessionId);
      console.log('participant left', e.user.displayName)
      Toastify({
        text: e.user.displayName+" left!",
        duration: 3000,
        close: true,
        gravity: "top", // `top` or `bottom`
        position: "right", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
          background: "linear-gradient(to right, #00b09b, #96c93d)",
        },
        onClick: function(){} // Callback after click
      }).showToast();
    });
  }

  _addSession(participant) {
    const color = this._options.colorManager.color(participant.user.username);
    const displayName = participant.user.displayName || participant.user.username;
    const session = new SessionItem({
      local: participant.local,
      username: participant.username,
      displayName: displayName,
      sessionId: participant.sessionId,
      color: color
    });

    this._sessions[participant.sessionId] = session;
    this._sessionList.append(session._el);
  }

  _removeSession(sessionId) {
    const session = this._sessions[sessionId];
    session.dispose();
    delete this._sessions[sessionId];
  }
}

class SessionItem extends UiComponent {

  constructor(options) {
    super("div", 'session-presence');
    this._options = options;
    this._init();
  }

  _init() {
    const displayName = this._options.displayName || this._options.username;
    const text = this._options.local ? displayName + " (You)" : displayName;
    this._el.append($("<div>", {class: "session-color"}).css("background-color", this._options.color));
    this._el.append($("<div>", {class: "session-name"}).html(text));
  }

}


