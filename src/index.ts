import { Options, Rect } from './types';

export default class Node<T extends Rect> {
    options: Required<Options>;
    private children: Node<T>[] = [];
    private objects: T[] = [];
    private parent = false;
    private total = 0;

    constructor(options: Options) {
        this.options = {
            level: 0,
            x: 0,
            y: 0,
            ...options,
        };
    }

    retrieve(box: Rect): T[] {
        let objects: T[] = [];

        if (this.options.level === 0 || this.inside(box)) {
            if (!this.parent) {
                objects = this.objects;
            } else {
                objects = [
                    ...this.children[0].retrieve(box),
                    ...this.children[1].retrieve(box),
                    ...this.children[2].retrieve(box),
                    ...this.children[3].retrieve(box),
                ];
            }
        }

        return objects;
    }

    insertAll(objects: T[]): void {
        const total = objects.length;

        for (let i = 0; i < total; i++) {
            this.insert(objects[i]);
        }
    }

    insert(object: T): void {
        if (
            !this.parent &&
            this.total >= this.options.max_objects &&
            this.options.level < this.options.max_depth
        ) {
            this.split();
            this.insertAll(this.objects);
            this.objects = [];
            this.total = 0;
        }

        if (this.parent) {
            if (this.children[0].inside(object)) {
                this.children[0].insert(object);
            }

            if (this.children[1].inside(object)) {
                this.children[1].insert(object);
            }

            if (this.children[2].inside(object)) {
                this.children[2].insert(object);
            }

            if (this.children[3].inside(object)) {
                this.children[3].insert(object);
            }

            return;
        }

        this.objects[this.total] = object;
        this.total++;
    }

    clear(): void {
        this.children = [];
        this.objects = [];
        this.total = 0;
        this.parent = false;
    }

    inside(box: Rect): boolean {
        return this.options.x <= box.x + box.width &&
            box.x <= this.options.x + this.options.width &&
            this.options.y <= box.y + box.height &&
            box.y <= this.options.y + this.options.height;
    }

    private split(): void {
        if (this.parent) {
            return;
        }

        this.parent = true;

        const level = this.options.level + 1;
        const width = this.options.width / 2;
        const height = this.options.height / 2;

        this.children[0] = new Node({
            ...this.options,
            level,
            x: this.options.x,
            y: this.options.y,
            width,
            height,
        });

        this.children[1] = new Node({
            ...this.options,
            level,
            x: this.options.x + width,
            y: this.options.y,
            width,
            height,
        });

        this.children[2] = new Node({
            ...this.options,
            level,
            x: this.options.x,
            y: this.options.y + height,
            width,
            height,
        });

        this.children[3] = new Node({
            ...this.options,
            level,
            x: this.options.x + width,
            y: this.options.y + height,
            width,
            height,
        });
    }
}

export * from './types';
