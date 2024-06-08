import { useState } from 'react'
import {v4 as uuidv4} from 'uuid'

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

type DNDType = {
  id: UniqueIdentifier;
  title: string;
  items: {
    id: UniqueIdentifier;
    title: string;
  }[];
}

const App = () => {
  const [containers, setContainers] = useState<DNDType[]>([])
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
      let newItems = []
    }
    
  }

}
const handleDragEnd = (event: DragEndEvent) => {}

 return (
  <div className='mx-auto max-w-7xl py-10'>
    <div className='flex items-center justify-between gap-y-2'>
      <h1 className='text-gray-200 text-3xl font-bold'>DND Kit Guide</h1>
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
              onAddItem={() => {}}
              >
                <SortableContext items={container.items.map((i) => i.id)}>
                  {container.items.map((i) => (
                    <Items title={i.title} id={i.id} key={i.id} />
                  ))}
                </SortableContext>
              </Container>
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  </div>
 )
}

export default App