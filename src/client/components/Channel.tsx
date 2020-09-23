import { h, VNode } from 'preact'
import { useState } from 'preact/hooks'
import { setChannelLabel, destroyChannel } from '../api'

type Props = {
	id: string
	label: string
	onChanged: () => unknown
}

export default function Channel({ id, label, onChanged }: Props): VNode {
	const [ currentLabel, setCurrentLabel ] = useState(label)

	const unsavedChanges = currentLabel !== label

	async function saveLabel() {
		await setChannelLabel(id, currentLabel)
		onChanged()
	}

	return (
		<div class="channel">
			<div class="left-group">
				<span class="id" title="Channel ID">{id}</span>
				<input
					class="label"
					title="Channel label"
					placeholder="Test Channel 1"
					onInput={e => {
						if(e.target instanceof HTMLInputElement) {
							setCurrentLabel(e.target.value)
						}
					}}
					onKeyUp={e => {
						if(e.key === 'Enter' && unsavedChanges) {
							saveLabel()
						}
					}}
					value={currentLabel}
				/>
			</div>
			<div class="right-group">
				{unsavedChanges &&
					<button
						class="save-btn"
						onClick={saveLabel}
					>Save Label</button>
				}
				<button
					class="del-btn"
					title="Delete channel"
					onClick={async () => {
						if(confirm('Are you sure you want to delete this channel?')) {
							await destroyChannel(id)
							if(onChanged) onChanged()
						}
					}}
				>Delete</button>
			</div>
		</div>
	)
}
