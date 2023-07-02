class ShareControls extends UiComponent {

  constructor(options) {
    super("div", "share-controls", "share-controls");
    this._options = options;
    this._init();
  }

  _init() {
    this._share = $('<span class="geButtonv" title="Get a Shareable Link"><i class="fa fa-2x fa-share-alt"></i></span>');
    this._el.append(this._share);
    this._share.on("click", () => {
      const el = document.createElement('textarea');
      el.value = window.location.href;
      el.setAttribute('readonly', '');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      document.body.appendChild(el);
      const selected =
        document.getSelection().rangeCount > 0
          ? document.getSelection().getRangeAt(0)
          : false;
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      if (selected) {
        document.getSelection().removeAllRanges();
        document.getSelection().addRange(selected);
      }

      Toastify({
        text: "URL Copied",
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
}
