import {
	type DirectiveAnnotation,
	MapperKind,
	getDirectives,
	mapSchema,
} from "@graphql-tools/utils";
import { type GraphQLSchema, defaultFieldResolver } from "graphql";
import type { DirectiveResolvers } from "../schema/types.generated";

export function attachDirectiveResolvers(
	schema: GraphQLSchema,
	directiveResolvers: DirectiveResolvers,
): GraphQLSchema {
	const typeDirectiveArgumentMaps: Record<
		string,
		DirectiveAnnotation[] | undefined
	> = {};
	return mapSchema(schema, {
		[MapperKind.TYPE]: (type) => {
			const directives = getDirectives(schema, type);
			for (const directive of directives) {
				if (typeDirectiveArgumentMaps[type.name] === undefined) {
					typeDirectiveArgumentMaps[type.name] = [];
				} else {
					// biome-ignore lint/style/noNonNullAssertion: It really isn't undefined any more but typeScript doesn't know that
					typeDirectiveArgumentMaps[type.name]!.push(directive);
				}
			}
			return undefined;
		},
		[MapperKind.OBJECT_FIELD]: (
			fieldConfig,
			fieldName,
			typeName,
			fullSchema,
		) => {
			const newFieldConfig = { ...fieldConfig };

			const typeDirectives = typeDirectiveArgumentMaps[typeName] ?? [];
			const objectDirectives = getDirectives(schema, fieldConfig);

			const directives = [...typeDirectives, ...objectDirectives];

			for (const directive of directives) {
				const directiveName = directive.name as keyof DirectiveResolvers;
				const directiveResolver = directiveResolvers[directiveName];
				if (!directiveResolver) {
					return;
				}

				const { resolve: originalResolver = defaultFieldResolver } =
					newFieldConfig;

				const directiveArgs = directive.args as Parameters<
					typeof directiveResolver
				>[2];
				newFieldConfig.resolve = async (
					source,
					originalArgs,
					context,
					info,
				) => {
					const nextFn = () =>
						new Promise((resolve, reject) => {
							const result = originalResolver(
								source,
								originalArgs,
								context,
								info,
							);
							if (result instanceof Promise) {
								result.then(resolve).catch(reject);
								return;
							}
							if (result instanceof Error) {
								reject(result);
							}
							resolve(result);
						});

					return directiveResolver(
						nextFn,
						source,
						directiveArgs,
						context,
						info,
					);
				};
			}

			return newFieldConfig;
		},
	});
}
