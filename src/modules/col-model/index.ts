
import { AbstractRowColModel, IColDescriptor } from '@grid/abstract-row-col-model';
import { Grid } from '@grid/core';

class ColModel extends AbstractRowColModel {
    width = (idx: number) => {
        return this.sizeOf(idx);
    }
    col = (idx: number): IColDescriptor => {
        return this.get(idx, true);
    }
}

export function create(grid: Grid) {
    return new ColModel(grid, 'col', 'width', 100);
}

export default create;