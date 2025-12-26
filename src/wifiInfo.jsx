import React from 'react';
import { Alert } from '@patternfly/react-core';
import cockpit from 'cockpit';

export const WifiInfo = (props) => {
    const [connections, setConnections] = React.useState([]);
    const [mssg, setMssg] = React.useState(props.msg);

    React.useEffect(() => {
        const loadActiveConnections = async () => {
            try {
                // Get all devices, status and type
                const allDevicesStatus = await cockpit.spawn(
                    ["nmcli", "-t", "--fields", "DEVICE,STATE,TYPE", "device", "status"]
                );
                // Parse and set the keys to show in the webpage
                const linesAllDevices = allDevicesStatus.split('\n').filter(line => line.trim() !== '');
                const allConnectionsData = [];
                const keysAllDevices = ["Dispositivo", "Estado", "Tipo", "Dirección IP"];
                const inactiveStates = ["disconnected", "unavailable", "deactivated"];

                // Prepair info to show
                for (const line of linesAllDevices) {
                    const statusValues = line.split(':');
                    const deviceName = statusValues[0];
                    // Get IP of the selected device
                    const ipDevice = await cockpit.spawn(
                        ["nmcli", "-t", "-g", "ip4.address", "device", "show", deviceName],
                    );
                    const ipAddress = ipDevice.trim();
                    const allValues = [...statusValues, ipAddress];
                    const isDeviceActive = !inactiveStates.some(state => statusValues[1].startsWith(state));
                    const connectionInfo = {
                        device: deviceName,
                        isActive: isDeviceActive,
                        details: allValues.map((item, index) => ({
                            key: keysAllDevices[index],
                            value: item
                        }))
                    };
                    allConnectionsData.push(connectionInfo);
                }
                setConnections(allConnectionsData);
            } catch (err) {
                console.error("Failed to load active connections:", err);
                setConnections([]);
            }
        };

        loadActiveConnections();
        setMssg(props.msg);
    }, [props.msg]);

    return (
        <Alert
            variant="info"
            customIcon=" "
        >{
                connections.length > 0
                    ? (
                        <div style={{ display: 'flex', flexWrap: 'noWrap', overflowX: 'auto' }}>
                            {connections.map((conn) => {
                                const textColor = conn.isActive ? 'lightblue' : '#999'; // Cockpit blue: '#2B9AF3'
                                return (
                                    <div key={conn.device} style={{ border: '1px solid', padding: '1rem', color: textColor, flexShrink: "0" }}>
                                        <h4>Dispositivo: {conn.device}</h4>
                                        {conn.details.map((item) => (
                                            item.key !== "Dispositivo" &&
                                            <p key={`${conn.device}-${item.key}`}>
                                                {cockpit.format("$0: \t $1", [item.key, item.value])}
                                            </p>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>
                    )
                    : (
                        <p>No hay dispositivos de red activos.</p>
                    )
            }
            <p>{mssg}</p>
        </Alert>
    );
};
