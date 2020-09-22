import { h, VNode } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import {
	NotificationResponse,
	disabledNotificationResponse,
	getNotificationState,
	createChannel,
	enableNotifications,
	disableNotifications
} from '../api.js'
import Channel from '../components/Channel.js'

export default function NotificationsPage(): VNode {
	const [ response, setResponse ] = useState<NotificationResponse>(disabledNotificationResponse)

	function refresh() {
		getNotificationState().then(setResponse)
	}

	useEffect(refresh, [])

	const { enabled, channels } = response

	return (
		<div class="notifications">
			<header>
				<h1>EasyPush</h1>
				<a class="docs" href="/">Docs</a>
				<button
					class="toggle-notifications"
					onClick={enabled
						? disableNotifications
						: enableNotifications
					}
				>
					{enabled
						? 'Disable Notifications'
						: 'Enable Notifications'
					}
				</button>
			</header>
			<div>
				<div class="enable-message">
					{enabled
						? (channels.length === 0
							? 'Create a channel to get started'
							: null
						)
						: 'Enable notifications to create channels'
					}
				</div>
				{channels.map(channel =>
					<Channel
						key={channel.id}
						id={channel.id}
						label={channel.label}
						onChanged={refresh}
					/>
				)}
			</div>
			{enabled &&
				<button
					class="create-channel"
					title="Create Channel"
					onClick={async () => {
						const label = prompt('Label this channel?')
						if(label !== null) {
							await createChannel(label)
							refresh()
						}
					}}
				>+</button>
			}
		</div>
	)
}