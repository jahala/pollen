# pollen — voice delta

Inherits the plotplot umbrella voice (calm · precise · literate · a little wit). One signature
line and a terminology table, merged with the umbrella at read time.

**Signature phrase:** *strangers knock; you decide.*

## Terminology

| Use | Not | Why |
|---|---|---|
| mailbox | queue, channel, topic | A file an agent can read. Nothing is subscribed, brokered, or streamed. |
| knock | request, handshake, auth | What an unvouched agent does at the gate. A person answers it. |
| the gate | ACL, allowlist, permissions | The one human decision the product is built around. |
| allow / deny | approve, whitelist, block | The two words the tools use; say them the same way in prose. |
| doorbell | notification, alert | The watch line rings; it does not carry the message. |
| peer | client, server, node | Every agent is both ends. There is no hierarchy to name. |
| relay | server, broker, hub | The HTTP hop between machines — it forwards, it does not hold state. |
| message | payload, packet, ping | Plain word for a plain thing. |
| carried | sent, transmitted | Where the metaphor earns it. Do not over-pollinate the prose. |

Errors say what happened, why it matters, and the next action:
`pollen could not reach the relay at <url>. The message was not delivered. Retry, or send it
to a local peer with pollen_send.`

Product name is lowercase always: `pollen`. The watch prefix is `[pollen]`.
The metaphor is a light touch — the tool is called pollen; the messages are still messages.
