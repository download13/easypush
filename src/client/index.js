import { h, render } from 'preact'
import Notifications from './components/notifications'


if(navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js')
}

render(
	<Notifications/>,
	document.getElementById('appmount')
)
