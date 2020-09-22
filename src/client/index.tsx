import { h, render } from 'preact'
import NotificationsPage from './pages/NotificationsPage'

if(navigator.serviceWorker) {
	navigator.serviceWorker.register('/sw.js')
}

render(
	<NotificationsPage />,
	document.getElementById('appmount') as HTMLElement
)
