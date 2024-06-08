import { useState } from 'react'
import {v4 as uuidv4} from 'uuid'
import { Button } from './components/ui/button.tsx'

import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  closestCorners,
  useSensor,
  useSensors
} from '@dnd-kit/core'

import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import Container from './components/Container/Container.tsx'
import Items from './components/Items/Items.tsx'
import Modal from './components/Modals/Modal.tsx'
import { Input } from './components/ui/input.tsx'

type DNDType = {
  id: UniqueIdentifier;
  title: string;
  items: {
    id: UniqueIdentifier;
    title: string;
  }[];
}

const App = () => {
  const [containers, setContainers] = useState<DNDType[]>([
    {
      id: `container-${uuidv4()}`,
      title: 'Container 1',
      items: [
        {
          id: `item-${uuidv4()}`,
          title: 'Item 1'
        }
      ]
    },
    {
      id: `container-${uuidv4()}`,
      title: 'Container 2',
      items: [
        {
          id: `item-${uuidv4()}`,
          title: 'Item 2'
        }
      ]
    }
  ])
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [currentContainerId, setCurrentContainerId] = useState<UniqueIdentifier>()
  const [containerName, setContainerName] = useState('')
  const [itemName, setItemName] = useState('')
  const [showAddContainerModal, setShowAddContainerModal] = useState(false)
  const [showAddItemModal, setShowAddItemModal] = useState(false)

  const findValueofItems = (id: UniqueIdentifier | undefined, type: string) => {
    if (type === 'container') {
      return containers.find((container) => container.id === id);
    }
    if (type === 'item') {
      return containers.find((container) => 
        container.items.find((item) => item.id === id),
      )
    }
  }

  const onAddContainer = () => {
    if(!containerName) return
    const id = `container-${uuidv4()}`
    setContainers([
      ...containers,
      {
        id,
        title: containerName,
        items: [],
      }
    ])
    setContainerName('')
    setShowAddContainerModal(false)
  }

  const onAddItem = () => {
    if (!itemName) return
    const id = `item-${uuidv4()}`
    const container = containers.find((item) => item.id === currentContainerId)
    if (!container) return
    container.items.push({
      id,
      title: itemName,
    })
    setContainers([...containers])
    setItemName('')
    setShowAddItemModal(false)
  }

  const findItemTitle = (id: UniqueIdentifier | undefined) => {
    const container = containers.find((item) => item.id === currentContainerId)
    if (!container) return ''
    const item = container.items.find((item) => item.id === id)
    if (!item) return ''
    return item.title
  }

// Dnd Handlers
const sensors = useSensors(
  useSensor(PointerSensor),
  useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  }),
)

const handleDragStart = (event: DragStartEvent) => {
  const { active } = event;
  const { id } = active;
  setActiveId(id);
}
const handleDragMove = (event: DragMoveEvent) => {
  const { active, over } = event;

  // Handle Items Sorting
  if (
    active.id.toString().includes('item') &&
    over?.id.toString().includes('item') &&
    active &&
    over &&
    active.id !== over.id
  ) {
    // Find the active container and over Container
    const activeContainer = findValueofItems(active.id, 'item')
    const overContainer = findValueofItems(over.id, 'item')

    // If active or over container is undefined, return
    if (!activeContainer || !overContainer) return;

    // Find the active and over container index
    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id,
    )
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id,
    )

    // Find index of active and over items
    const activeItemIndex = activeContainer.items.findIndex(
      (item) => item.id === active.id
    )
    const overItemIndex = overContainer.items.findIndex(
      (item) => item.id === over.id
    )

    // In the same container
    if (activeContainerIndex === overContainerIndex) {
      let newItems = [...containers];
      newItems[activeContainerIndex].items = arrayMove(
        newItems[activeContainerIndex].items,
        activeItemIndex,
        overItemIndex
      )

      setContainers(newItems)
    } else {
      // in a different container
      let newItems = [...containers];
      const [removedItem] = newItems[activeContainerIndex].items.splice(
        activeItemIndex,
        1
      )
      newItems[overContainerIndex].items.splice(
        overItemIndex,
        0,
        removedItem
      )
      setContainers(newItems)
    }  
  }

  // Handle Item Drop into a container
  if (
    active.id.toString().includes('item') &&
    over?.id.toString().includes('container') &&
    active &&
    over &&
    active.id !== over.id
  ) {
    // Find the active container and over Container
    const activeContainer = findValueofItems(active.id, 'item')
    const overContainer = findValueofItems(over.id, 'container')

    // if active or over container is undefined
    if (!activeContainer || !overContainer ) return

    // find the index of the active and over container.
    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id
    )
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id
    )

    // Find the index of the active item in the active container
    const activeItemIndex = activeContainer.items.findIndex(
      (item) => item.id === active.id,
    )

    // Remove the active item from the active container and add it to the over container
    let newItems = [...containers]
    const [removedItem] = newItems[activeContainerIndex].items.splice(
      activeItemIndex,
      1
    )
    newItems[overContainerIndex].items.push(removedItem);

    setContainers(newItems);
  }

}
const handleDragEnd = (event: DragEndEvent) => {
  const { active, over } = event

  // Handle Container Sorting
  if (
    active.id.toString().includes('container') &&
    over?.id.toString().includes('container') &&
    active &&
    over &&
    active.id !== over.id
  ) {
    const activeContainerIndex = containers.findIndex(
      (container) => container.id === active.id
    )
    const overContainerIndex = containers.findIndex(
      (container) => container.id === over.id
    )

    // Swat the active and over container
    let newItems = [...containers]
    newItems = arrayMove(newItems, activeContainerIndex, overContainerIndex)
    setContainers(newItems)
  }

  // Handle Item Sorting
  if (
    active.id.toString().includes('item') &&
    over?.id.toString().includes('item') &&
    active &&
    over &&
    active.id !== over.id
  ) {
    // Find the active container and over container
    const activeContainer = findValueofItems(active.id, 'item')
    const overContainer = findValueofItems(over.id, 'item')

    // if active or over container is undefined
    if (!activeContainer || !overContainer ) return

    // Find the active and over container index
    const activeContainerIndex = containers.findIndex(
      (container) => container.id = activeContainer.id,
    )
    const overContainerIndex = containers.findIndex(
      (container) => container.id = overContainer.id,
    )

    // find the index of the active and over item
    const activeItemIndex = activeContainer.items.findIndex(
      (item) => item.id === active.id
    )
    const overItemIndex = overContainer.items.findIndex(
      (item) => item.id === over.id
    )

    // in the same container
    if (activeContainerIndex === overContainerIndex) {
      let newItems = [...containers]
      newItems[activeContainerIndex].items = arrayMove(
        newItems[activeContainerIndex].items,
        activeItemIndex,
        overItemIndex
      )
      setContainers(newItems)
    } else {
      // different containers
      let newItems = [...containers]
      const [removedItem] = newItems[activeContainerIndex].items.splice(
        activeItemIndex,
        1,
      )
      newItems[overContainerIndex].items.splice(
        overItemIndex,
        0,
        removedItem
      )
      setContainers(newItems)
    }
  }

  // Handle item drop into a container
  if (
    active.id.toString().includes('item') &&
    over?.id.toString().includes('item') &&
    active &&
    over &&
    active.id !== over.id
  ) {
    // Find the active container and over container
    const activeContainer = findValueofItems(active.id, 'item')
    const overContainer = findValueofItems(over.id, 'item')

    // if active or over container is undefined
    if (!activeContainer || !overContainer ) return


    // Find the index of the active and over container
    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id
    )
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id
    )

    // Find the index of the active item in the active container
    const activeItemIndex = activeContainer.items.findIndex(
      (item) => item.id === active.id
    )

    let newItems = [...containers]
    const [removedItem] = newItems[activeContainerIndex].items.splice(
      activeItemIndex,
      1,
    )
    newItems[overContainerIndex].items.push(removedItem)
    setContainers(newItems)
  }
  setActiveId(null)
}

 return (
  <div className='mx-auto max-w-7xl py-10'>
    {/* Add Container Modal */}
    <Modal 
    showModal={showAddContainerModal}
    setShowModal={setShowAddContainerModal}
    >
      <div className='flex flex-col w-full items-start gap-4'>
        <h1 className='text-gray-800 text-3xl font-bold'>Add Container</h1>
        <Input
          type="text"
          placeholder='Container Title'
          name='containername'
          value={containerName}
          onChange={(e) => setContainerName(e.target.value)}
          />
        <Button className='btn btn-primary' onClick={onAddContainer}>Add Container</Button>
      </div>
    </Modal>
    {/* Add item modal */}
    <Modal 
    showModal={showAddItemModal}
    setShowModal={setShowAddItemModal}
    >
      <div className='flex flex-col w-full items-start gap-4'>
        <h1 className='text-gray-800 text-3xl font-bold'>Add Container</h1>
        <Input
          type="text"
          placeholder='Item Title'
          name='itemname'
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          />
        <Button className='btn btn-primary' onClick={onAddItem}>Add Item</Button>
      </div>
    </Modal>
    <div className='flex items-center justify-between gap-y-2'>
      <h1 className='text-gray-200 text-3xl font-bold'>DND Kit Guide</h1>
      <Button onClick={() => setShowAddContainerModal(true)}>Add Container</Button>
    </div>
    <div className='mt-10'>
      <div className='grid grid-cols-3 gap-6'>
        <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}>
          <SortableContext items={containers.map((i) => i.id)}>
            {containers.map((container) => (
              <Container
              id={container.id}
              title={container.title}
              key={container.id}
              onAddItem={() => {
                setShowAddItemModal(true)
                setCurrentContainerId(container.id)
              }}
              >
                <SortableContext items={container.items.map((i) => i.id)}>
                  {container.items.map((i) => (
                    <Items title={i.title} id={i.id} key={i.id} />
                  ))}
                </SortableContext>
              </Container>
            ))}
          </SortableContext>
          <DragOverlay>
            {
              activeId && activeId.toString().includes('item') && (
                <Items id={activeId} title={findItemTitle(activeId)} />
              )
            }
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  </div>
 )
}

export default App