import { h, Component } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import {
	NotificationResponse,
	disabledNotificationResponse,
	getNotificationState,
	createChannel,
	enableNotifications,
	disableNotifications
} from '../api'

export default function Notification() {
	const [ response, setResponse ] = useState<NotificationResponse>(disabledNotificationResponse)

	function refresh() {
		getNotificationState().then(setResponse)
	}

	useEffect(refresh, [])

	const { enabled, channels } = response

	let createButton, enableMessage
	if(notificationsEnabled) {


		if(channels.length === 0) {
			enableMessage = <div class="enable-message">Create a channel to get started</div>
		}
	} else {

		enableMessage = <div class="enable-message">Enable notifications to create channels</div>
	}

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
				{enableMessage}
				{channels.map(channel =>
					<Channel
						key={channel.id}
						onChanged={refresh} {...channel}
					/>
				)}
			</div>
			{enabled &&
				<button
					class="create-channel"
					title="Create Channel"
					onClick={() => {
						const label = prompt('Label this channel?');
						if(label !== null) {
							await createChannel(label);
							refresh()
						}
					}}
				>+</button>
			}
		</div>
	)
