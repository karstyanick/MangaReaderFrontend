
import { useCombobox } from 'downshift';
import React from 'react';
import { decodeHtml } from '../Utils/String.utils';

export interface AvailableManga {
  id: string,
  label: string
};

interface AutocompleteProps {
  items: AvailableManga[];
  onSelect: (item: AvailableManga | null) => void;
}

export const Autocomplete: React.FC<AutocompleteProps> = ({ items, onSelect }) => {
  const [inputItems, setInputItems] = React.useState<AvailableManga[]>(items);

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    inputValue
  } = useCombobox<AvailableManga>({
    items: inputItems,
    itemToString: item => decodeHtml(item?.label || "") ?? '',
    onInputValueChange: ({ inputValue }) => {
      setInputItems(
        items.filter(i =>
          i.label.toLowerCase().includes(inputValue?.toLowerCase() ?? '')
        )
      );
    },
    onSelectedItemChange: ({ selectedItem }) => {
      console.log(`You picked: ${selectedItem?.label}`);
      onSelect(selectedItem ?? null);
    },
  });

  const showSuggestions = inputValue.length >= 3 && isOpen;

  return (
    <div style={{ position: 'relative', width: 250 }}>
      <input {...getInputProps({ placeholder: 'Manga name' })} />
      <ul
        {...getMenuProps()}
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          margin: 0,
          padding: 0,
          listStyle: 'none',
          background: 'white',
          maxHeight: 150,
          overflowY: 'auto',
          zIndex: 1,
        }}
      >
        {showSuggestions &&
          inputItems.map((item, index) => (
            <li
              key={item.id}
              {...getItemProps({ item, index })}
              style={{
                backgroundColor:
                  highlightedIndex === index ? '#bde4ff' : 'white',
                padding: '4px 8px', cursor: 'pointer',
              }}
            >
              {decodeHtml(item.label)}
            </li>
          ))}
      </ul>
    </div>
  );
};
