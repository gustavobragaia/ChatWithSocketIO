interface ListingRoomsProps{
    rooms: string[],
    visibleListOfRooms: boolean,
}

export function ListingRooms({rooms, visibleListOfRooms}: ListingRoomsProps){
    return(
            rooms.length === 0 && visibleListOfRooms ? (
               <div style={{display:"flex"}}>    
                <p style={{padding: '5px 10px', border: '1px solid #ffffff38', borderRadius: "10px"}}>Nenhuma sala encontrada</p>
              </div> 
            ) 
            : (
                rooms.map((singleRoom) => (
                  <div key={singleRoom} style={{ display: 'flex' }}>
                    <p
                      style={{
                        padding: '5px 10px',
                        border: '1px solid #ffffff38',
                        borderRadius: '10px',
                      }}
                    >
                      {singleRoom}
                    </p>
                  </div>
                  ))
            ))}