const {St, GLib, Clutter} = imports.gi;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const timeSpawn = 7200.0;//interval between spawns, in seconds

let timeout, myPopup , popupText;

const MyPopup = GObject.registerClass(
class MyPopup extends PanelMenu.Button {
  _init () {    
    super._init(0);
    let pmItem = new PopupMenu.PopupMenuItem('Install updates');
    pmItem.connect('activate', () => {
		GLib.spawn_command_line_async('/home/speltriao/.local/share/gnome-shell/extensions/pacmancounter@example.com/launch.sh');
    });
    this.menu.addMenuItem(pmItem);
    this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem());
  }
});


async function execCommunicate(argv, input = null, cancellable = null) {
    let cancelId = 0;
    let flags = (Gio.SubprocessFlags.STDOUT_PIPE |
                 Gio.SubprocessFlags.STDERR_PIPE);

    if (input !== null)
        flags |= Gio.SubprocessFlags.STDIN_PIPE;

    let proc = new Gio.Subprocess({
        argv: argv,
        flags: flags
    });
    proc.init(cancellable);
    
    if (cancellable instanceof Gio.Cancellable)
        cancelId = cancellable.connect(() => proc.force_exit());

    return new Promise((resolve, reject) => {
        proc.communicate_utf8_async(input, null, (proc, res) => {
            try {
                let [, stdout, stderr] = proc.communicate_utf8_finish(res);
                let status = proc.get_exit_status();

                if (status !== 0) {
                    throw new Gio.IOErrorEnum({
                        code: Gio.io_error_from_errno(status),
                        message: stderr ? stderr.trim() : GLib.strerror(status)
                    });
                }

                resolve(stdout.trim());
            } catch (e) {
                reject(e);
            } finally {
                if (cancelId > 0)
                    cancellable.disconnect(cancelId);
            }
        });
    });
}

function countUpdates(){
	let loop = GLib.MainLoop.new(null, false);
	let count;
	execCommunicate(['/home/speltriao/.local/share/gnome-shell/extensions/pacmancounter@example.com/check.sh']).then(stdout => {
    	stdout.split('\n');
    	count = stdout.toString();
    	
    	loop.quit();
	}).catch(logError);

	loop.run();
	return count;
}

function setButtonText () {
  let count = countUpdates();
  popupText.set_text(count.toString());
  myPopup.add_child(popupText);
  return true;
}

function init () { 
 myPopup = new MyPopup();
 popupText = new St.Label({
    	style_class : "examplePanelText",
        y_align: Clutter.ActorAlign.CENTER
  });
  Main.panel.addToStatusArea('myPopup', myPopup, 1);
}

function enable () {
  setButtonText();
  timeout = Mainloop.timeout_add_seconds(timeSpawn, setButtonText);
}

function disable () {
  Mainloop.source_remove(timeout);
  Main.panel._rightBox.remove_child(myPopup);
}

