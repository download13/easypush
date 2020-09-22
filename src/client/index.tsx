import { h, render } from 'preact'
import Notifications from './components/Notifications'


if(navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js')
}

render(
	<Notifications />,
	document.getElementById('appmount') as HTMLElement
)
