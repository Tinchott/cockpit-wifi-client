import React from 'react';
import { Alert } from '@patternfly/react-core';
import cockpit from 'cockpit';

export const WifiInfo = (props) => {
    const [connections, setConnections] = React.useState([]);
    const [mssg, setMssg] = React.useState(props.msg);

    React.useEffect(() => {
        const loadActiveConnections = async () => {
            try {
                const activeList = await cockpit.spawn(
                    ["nmcli", "-t", "--fields", "TYPE,DEVICE", "connection", "show", "--active"],
                    { latency: "10000" }
                );
                const lines = activeList.split('\n').filter(line => line.trim() !== '');

                const devices = lines.map(line => line.split(':')[1]);

                const allConnectionsData = [];
                const keys = ["Conexión Activa", "Estado", "Dirección IP"];

                for (const device of devices) {
                    const data = await cockpit.spawn(
                        ["nmcli", "-t", "-e", "no", "-g", "general.connection,general.state,ip4.address", "device", "show", device],
                        { latency: "10000" }
                    );
                    
                    const values = data.split("\n").filter(line => line.trim() !== '');
                    
                    // Create an object for each device's info
                    const connectionInfo = {
                        device: device,
                        details: values.map((item, index) => ({
                            key: keys[index],
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
            title={
                connections.length > 0 ? (
                    connections.map((conn) => (
                        <div key={conn.device}>
                            <h4>Dispositivo: {conn.device}</h4>
                            {conn.details.map((item) => (
                                <p key={`${conn.device}-${item.key}`}>
                                    {cockpit.format("$0: \t $1", [item.key, item.value])}
                                </p>
                            ))}
                        </div>
                    ))
                ) : (
                    <p>No hay dispositivos de red activos.</p>
                )
            }
        >
            <p>{mssg}</p>
        </Alert>
    );
};
/*    
    React.useEffect(() => {
        const keys = ["Conexión Activa", "Estado", "Dirección IP"];
        const loadState = async () => {
            const data = await cockpit.spawn(["nmcli", "-t", "-e", "no", "-g", "general.connection,general.state,ip4.address", "device", "show", "wlp0s20f3"], { latency:"10000" });
            const arr = data.split("\n");
            const json = arr.map((item, index) => {
                return {
                    key: keys[index],
                    value: item
                };
            });
            setState(json);
        };
        loadState()
                .catch(err => {
                    console.log(err);
                });
        setMssg(props.msg);
    }, [props.msg]);

    return (
        <Alert
        variant="info"
        title={ state.map((item) => {
            return (
                cockpit.format("$0: \t $1\n $2", [item.key, item.value])

            );
        })}
        >
            <p>{mssg}</p>
        </Alert>
    );
};
*/