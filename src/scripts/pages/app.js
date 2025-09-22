import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import { tokenService } from "../utils/tokenService/tokenService";
import { subscribe } from '../utils/notification/notificationHelper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }
  #setupAuthUI() {
    const loginMenu = document.getElementById("loginUser");
    const logoutMenu = document.getElementById("logoutUser");
    if (tokenService.isAuthenticated()) {
      loginMenu.classList.add("Gone");
      logoutMenu.classList.remove("Gone");
    } else {
      loginMenu.classList.remove("Gone");
      logoutMenu.classList.add("Gone");
    }
    // attach event logout
    const logoutBtn = logoutMenu.querySelector("a");
    if (logoutBtn) {
      logoutBtn.onclick = (e) => {
        e.preventDefault();
        tokenService.clearAuthData();
        loginMenu.classList.remove("Gone");
        logoutMenu.classList.add("Gone");
        window.location.hash = "/login";
      };
    }
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url];

    this.#content.innerHTML = await page.render();
    await page.afterRender();
    this.#setupAuthUI();

  }
}

export default App;