const {St, GLib, Clutter} = imports.gi;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Util = imports.misc.util;
const timeSpawn = 3600.0;//interval between spawns, in seconds

let timeout, myPopup , popupText;

const MyPopup = GObject.registerClass(
class MyPopup extends PanelMenu.Button {
  _init () {    
    super._init(0);
    let pmItem = new PopupMenu.PopupMenuItem('Install updates');
    pmItem.connect('activate', () => {
		Util.spawnCommandLine("gnome-terminal -e 'sh -c  \"sudo paru && flatpak update && gnome-extensions disable pacmancounter@speltriao.com && gnome-extensions enable pacmancounter@speltriao.com ; echo Done - Press enter to exit; read _\" '");
    });
    this.menu.addMenuItem(pmItem);
    this.menu.addMenuItem( new PopupMenu.PopupSeparatorMenuItem());
    let pmItem2 = new PopupMenu.PopupMenuItem('Count updates');
    pmItem2.connect('activate', () => {
		countUpdates();
    });
    this.menu.addMenuItem(pmItem2);
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

async function countUpdates() {
	let count;
    await execCommunicate(['/home/speltriao/.local/share/gnome-shell/extensions/pacmancounter@speltriao.com/check.sh']).then(stdout => {
    	stdout.split('\n');
    	count = stdout.toString();
    	}).catch(logError);
    popupText.set_text(count.toString());
  	myPopup.add_child(popupText);
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
  countUpdates();
  timeout = Mainloop.timeout_add_seconds(timeSpawn, countUpdates);
}

function disable () {
  Mainloop.source_remove(timeout);
  Main.panel._rightBox.remove_child(myPopup);
}


