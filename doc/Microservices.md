# DALTA Backend Services

Current local service split:

| Service | Port | Source | Command |
| --- | ---: | --- | --- |
| Auth + Users | 3000 | `src-auth-users` | `npm.cmd run start:dev` |
| Products | 3001 | `src-products` | `npm.cmd run start:products:dev` |
| Categories | 3002 | `src-categories` | `npm.cmd run start:categories:dev` |
| Orders | 3003 | `src-orders` | `npm.cmd run start:orders:dev` |
| Cart | 3004 | `src-cart` | `npm.cmd run start:cart:dev` |
| API Gateway | 3005 | `src-gateway` | `npm.cmd run start:gateway:dev` |
| Payments | 3006 | `src-payments` | `npm.cmd run start:payments:dev` |
| Notifications | 3007 | `src-notifications` | `npm.cmd run start:notifications:dev` |

Frontend calls API Gateway by default:

| Domain | Default URL | Env override |
| --- | --- | --- |
| All frontend API calls | `http://localhost:3005` | `VITE_API_BASE_URL` |

Gateway routes:

| Path | Target |
| --- | --- |
| `/auth`, `/users` | `AUTH_USERS_SERVICE_URL` or `http://localhost:3000` |
| `/products`, `/brands`, `/wishlist` | `PRODUCTS_SERVICE_URL` or `http://localhost:3001` |
| `/categories` | `CATEGORIES_SERVICE_URL` or `http://localhost:3002` |
| `/orders` | `ORDERS_SERVICE_URL` or `http://localhost:3003` |
| `/cart` | `CART_SERVICE_URL` or `http://localhost:3004` |
| `/payments` | `PAYMENTS_SERVICE_URL` or `http://localhost:3006` |
| `/notifications` | `NOTIFICATIONS_SERVICE_URL` or `http://localhost:3007` |

The services intentionally share one MySQL database for simpler demo setup. API Gateway performs a lightweight JWT check before proxying protected customer routes such as `/cart`, `/orders`, `/users/profile`, `/users/addresses`, and `/wishlist`. Admin-only CRUD endpoints for products, brands, and categories are enforced inside their owning services with JWT + role guards. Gateway logs each proxied request with method, URL, target service, status code, and duration.

Product Service also exposes simple Epic 6 backend APIs:

| Feature | Endpoint |
| --- | --- |
| Product reviews | `GET /products/:productId/reviews`, `POST /products/:productId/reviews` |
| Wishlist | `GET /wishlist`, `POST /wishlist/:productId`, `DELETE /wishlist/:productId` |

Internal service calls use `INTERNAL_SERVICE_KEY` for service-to-service endpoints. Orders calls Cart, Users, and Payments over HTTP. Payments handles Stripe checkout/webhook and notifies Orders through an internal endpoint. Auth + Users creates reset tokens, then calls Notifications to send reset-password email.

Remaining production cleanup: split database ownership if production-level isolation is required, and replace internal HTTP calls with a broker such as RabbitMQ/Kafka if asynchronous event processing is required.
