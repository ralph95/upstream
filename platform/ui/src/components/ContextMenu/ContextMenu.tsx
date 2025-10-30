import React from 'react';
import PropTypes from 'prop-types';
import Typography from '../Typography';
import { Icons } from '@ohif/ui-next';

const ContextMenu = ({ items, ...props }) => {
  if (!items) {
    return null;
  }

  return (
    <div
      data-cy="context-menu"
      className="relative z-50 block w-48 rounded bg-[rgb(var(--secondary-dark))]"
      onContextMenu={e => e.preventDefault()}
    >
      {items.map((item, index) => (
        <div
          key={index}
          data-cy="context-menu-item"
          onClick={() => item.action(item, props)}
          style={{ justifyContent: 'space-between' }}
          className="border-primary-dark flex cursor-pointer items-center border-b px-4 py-3 transition duration-300 last:border-b-0 hover:bg-[rgb(var(--primary-dark))]"
        >
          <Typography>{item.label}</Typography>
          {item.iconRight && (
            <Icons.ByName
              name={item.iconRight}
              className="inline text-[rgb(var(--text))]"
            />
          )}
        </div>
      ))}
    </div>
  );
};

ContextMenu.propTypes = {
  defaultPosition: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number,
  }),
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      action: PropTypes.func.isRequired,
    })
  ),
};

export default ContextMenu;
