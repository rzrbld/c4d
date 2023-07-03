class PresenceList extends UiComponent {


  // <div class="dropdown" id="gePresenceContainer">
	// 	<a href="#" class="d-flex align-items-center text-white text-decoration-none dropdown-toggle" id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
	// 	  <!-- <img src="https://github.com/mdo.png" alt="" width="32" height="32" class="rounded-circle me-2"> -->
	// 	  <minidenticon-svg id="myAvatar" username="laurent"></minidenticon-svg>
	// 	</a>
	// 	<ul class="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
	// 	  <li><a class="dropdown-item" href="#">New project...</a></li>
	// 	  <li><a class="dropdown-item" href="#">Settings</a></li>
	// 	  <li><a class="dropdown-item" href="#">Profile</a></li>
	// 	  <li><hr class="dropdown-divider"></li>
	// 	  <li><a class="dropdown-item" href="#">Sign out</a></li>
	// 	</ul>
	//   </div>



  constructor(options) {
    super("div", 'userlist');
    this._options = options;
    this._sessions = {};

    // const title = $("<div class='presence-title'>Users</div>");
    // this._el.append(title);

    this._sessionList = $("<div />", {class: "session-list"});
    this._el.append(this._sessionList);
    this._init();
  }

  _init() {
    const participants = this._options.activity.participants().sort((a, b) => a.local ? -1 : 1);
    var i=0
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
    if(this._options.local){
      var userDropdown = document.createElement('a');
      userDropdown.className = "d-flex";
      userDropdown.classList.add("align-items-center");
      userDropdown.classList.add("text-white");
      userDropdown.classList.add("text-decoration-none");
      userDropdown.classList.add("dropdown-toggle");
      userDropdown.id = "dropdownUser1";
      userDropdown.setAttribute("data-bs-toggle","dropdown");
      userDropdown.setAttribute("aria-expanded","false");

      var userImg = document.createElement('minidenticon-svg');
      userImg.setAttribute('username',displayName);
      userDropdown.append(userImg);

      var userName  = document.createElement('div');
      userName.classList.add("session-name");
      userName.innerText = displayName;
      userDropdown.append(userName);

      var userMenu = document.createElement('ul');
      userMenu.classList.add("dropdown-menu");
      userMenu.classList.add("dropdown-menu-dark");
      userMenu.classList.add("text-small");
      userMenu.classList.add("shadow");
      userMenu.setAttribute('aria-labelledby',"dropdownUser1");
      userMenu.innerHTML='<li><a class="dropdown-item" href="#">New project...</a></li> <li><a class="dropdown-item" href="#">Settings</a></li> <li><a class="dropdown-item" href="#">Profile</a></li> <li><hr class="dropdown-divider"></li> <li><a class="dropdown-item" href="#">Sign out</a></li>';


      var userContainer = document.createElement('div');
      userContainer.classList.add("dropup");
      userContainer.classList.add("absolute-dropdown");

      userContainer.append(userDropdown);
      userContainer.append(userMenu);
      this._el.append(userContainer);
      this._el.addClass("absolute-you-user");

      // var emptyPlaceholder = document.createElement('div');
      // emptyPlaceholder.classList.add("placeholder-user");
      // this._el.append(emptyPlaceholder);
    } else {
      this._el.append($("<minidenticon-svg>", {username: displayName}))
      this._el.append($("<div>", {class: "session-name"}).html(displayName));
    }
   

  }

}


